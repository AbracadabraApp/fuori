import Foundation
import Observation
import FuoriCore
import FuoriNetworking
import FuoriAudio
#if canImport(UIKit)
import UIKit
#endif
#if os(iOS)
import AVFoundation
#endif

/// One conversation (docs/12-native-app.md → Audio pipeline): the character
/// speaks by himself; by default the learner taps to talk and taps again when
/// done (Josh, 2026-10-15: two-way hands-free isn't the best default). With
/// Hands-free on in Settings, the mic opens by itself and the turn ends after
/// a silence. The mic is
/// open only during the learner's turn. Pause is always available; calls,
/// Siri, AirPods out and backgrounding pause, and the mic never reopens
/// without a tap (docs/13-ios-conventions.md R4, D3).
@MainActor
@Observable
public final class ConversationModel {
    public enum Phase: Equatable {
        /// Getting the opening line
        case starting
        /// The character is speaking
        case speaking
        /// Mic open, waiting for the learner's first word
        case listening
        /// The learner has spoken; `ring` fills during the silence that ends the turn
        case hearing
        /// Understanding the learner and getting the reply
        case thinking
        /// The learner's turn, mic closed: a tap opens it (the default, and
        /// always under VoiceOver so it doesn't record VoiceOver's own voice)
        case tapToTalk
        /// Scaffolding (the server says when, lib/scaffold.ts): the
        /// learner's turn is a tap on one of two replies; `replies` is nil
        /// while they're still being written
        case choosing
        case micDenied
    }

    public private(set) var phase: Phase = .starting {
        didSet { if phase != oldValue { phaseLog.note(phase) } }
    }
    /// The last few phases with their times, for error reports
    @ObservationIgnored private var phaseLog = PhaseLog()
    /// The character's current line and its English
    public private(set) var line: String?
    public private(set) var english: String?
    /// Beginner level dialogue: her turn in parts (APIClient.TurnPart), or nil
    public private(set) var parts: [APIClient.TurnPart]?
    /// Typewriter subtitles: how many characters of `line` have been spoken so
    /// far; nil once the whole line is out (then the English appears too)
    public private(set) var shown: Int?
    private var revealTask: Task<Void, Never>?
    /// 0...1: how far the end-of-turn silence has run
    public private(set) var ring: Double = 0
    /// 0...1: the mic level, for the listening dots
    public private(set) var level: Double = 0
    /// A short note under the subtitles, e.g. when nothing was heard
    public private(set) var note: String?
    public private(set) var conversationId: String?
    /// The two suggested answers for this turn (scaffolding), once written
    public private(set) var replies: [APIClient.ReplyOption]?
    /// The answer tapped where answers are buttons (VoiceOver, mic off),
    /// shown selected until the character answers
    public private(set) var chosen: APIClient.ReplyOption?

    /// What the hidden debug panel shows (Settings → Developer), as the web's ?debug=1
    public struct DebugInfo: Equatable {
        public var promptVersion: String?
        /// What speech to text heard (never shown otherwise: immersion)
        public var heard: String?
        public var voice: String?
        /// Milliseconds per step of the last turn: transcribe, turn, voice
        public var timings: [String: Int] = [:]
        public var lastError: String?
    }
    public private(set) var debug = DebugInfo()

    private static func now() -> TimeInterval { ProcessInfo.processInfo.systemUptime }
    private func time(_ step: String, since start: TimeInterval) {
        debug.timings[step] = Int((Self.now() - start) * 1000)
    }

    public let city: City
    public let place: Place
    public let character: Character
    private let language: Language
    /// For VoiceOver: words in the language being learned are read in it
    public var speechLanguage: String { language.speechLang }
    /// Say it in English: the label on what the learner said, in the language ("Come si dice:")
    public var howToSay: String? { language.ui.howToSay }
    private let api: APIClient
    private let onSave: (String) -> Void

    private let voice = Voice()
    private let recorder = Recorder()
    private let gate = GateBox()
    private var listenTask: Task<Void, Never>?
    private var turnStartedAt: TimeInterval = 0
    /// Bumped whenever something stops the current step; late results from an
    /// older step are dropped
    private var generation = 0
    /// Something cut in while the reply was on its way: it's shown, not said
    private var interrupted = false
    private var observers: [NSObjectProtocol] = []
    /// The replies to the current line, written while the character speaks
    private var repliesTask: Task<Result<APIClient.Replies, Error>, Never>?

    /// One tap per turn (Josh, 2026-10-23): the learner taps to talk and
    /// silence sends it; no second tap (a tap still sends early). 10 s for
    /// the first word (20 s before reading a line from say it in English,
    /// which takes a moment), then 2.5 s of silence ends the turn (Josh: 2 s agreed, then 2.5 s, 2026-10-23).
    /// No "more time to answer" setting (Josh, 2026-10-16: confusing).
    /// The turn opens on a tap, always: the Hands-free setting is hidden
    /// (Josh, 2026-10-23), and a stored "on" is ignored so nobody is left
    /// with a mic that opens by itself and no switch to turn it off
    public var tapMode: Bool { true }
    /// Silence ends the turn, except under VoiceOver, where a tap ends it (the
    /// screen reader's own voice would keep it open)
    public var endsOnSilence: Bool { !isVoiceOverRunning }
    /// Under VoiceOver: a turn can't run longer than this, in case the second tap never comes
    private let longestTurn: TimeInterval = 90
    private var firstWordWait: TimeInterval = 10
    private let readingWait: TimeInterval = 20
    // The silence that ends a turn: EndOfTurn (2.5 s, Josh; sooner after a finished sentence)
    /// Less than this much voice isn't a turn (a cough, a click)
    private let minimumVoice: TimeInterval = 0.25

    /// Scaffolding (docs/glossary.md): the learner's turn is a tap on the
    /// reply buttons, with the English of the character and of both replies.
    /// The server decides with each line (beginners start with it, for the
    /// first turns of each conversation, fewer as conversations add up:
    /// lib/scaffold.ts; Josh, 2026-10-21: no switch)
    public private(set) var scaffolding = false

    /// Which answers this turn (lib/scaffold.ts; docs/reply-panel.md): read
    /// (two good answers) or choose (only one fits). Either way the learner
    /// reads one out loud on the mic, which works as everywhere: what was
    /// heard goes to the character (Josh, 2026-10-22: tap-only went)
    public enum Stage: String, Sendable { case read, choose }
    public private(set) var stage: Stage?

    /// Say it in English (docs/beginner-scaffolding.md; Josh, 2026-10-23): what
    /// the learner said in English and the line to read out loud. Shown from
    /// the moment it comes back until she answers
    public struct SayIt: Equatable, Sendable {
        public let english: String
        public let line: String
        public let en: String
    }
    public private(set) var sayIt: SayIt?
    /// The line is being played (hear it), so the mic is closed for it
    public private(set) var hearingLine = false

    /// The panel's extra line, on the learner's first scaffolded turn ever
    public private(set) var firstTime = false

    /// Answers as buttons that send the line, where reading aloud can't work:
    /// VoiceOver (it would be recorded) or the mic off
    public var answersAreButtons: Bool { isVoiceOverRunning || phase == .micDenied || phase == .choosing }

    /// The answers panel shows from the learner's turn until the character answers
    public var showsAnswers: Bool {
        guard scaffolding, replies != nil, sayIt == nil else { return false }
        return [.tapToTalk, .listening, .hearing, .thinking, .choosing, .micDenied].contains(phase)
    }

    /// The how-to above the mic in the answers panel (interface text, English)
    public var instruction: String? {
        guard showsAnswers else { return nil }
        switch phase {
        case .tapToTalk: return firstTime ? "Tap the mic, then read one out loud" : "Tap, then read one out loud"
        case .listening, .hearing: return "Read one out loud"
        case .thinking: return "Sent"
        case .choosing, .micDenied: return "Tap one to say it"
        default: return nil
        }
    }

    /// How loud the character's voice is now (0...1), nil when it can't be
    /// measured; read every frame by the circle's wave
    public var voiceLevel: Double? { voice.level }

    private let beginner: Bool

    /// The Beginner hint under her first line (Josh, 2026-10-23, canvas G1):
    /// "Answer in Italian or English", until the learner has said something
    /// in this conversation. Interface text, English; the language's name from
    /// content
    public var openerHint: String? {
        guard beginner, parts == nil, learnerLines == 0, sayIt == nil, line != nil, shown == nil else { return nil }
        guard [.tapToTalk, .listening, .hearing].contains(phase) else { return nil }
        return "Answer in \(language.name) or English"
    }

    /// Beginner dialogue: the parts in the language as they're said: a part
    /// shows once the voice has reached it in `line` (all of them once she's
    /// done); the answers wait for the learner's turn
    public var shownParts: [APIClient.TurnPart] {
        guard let parts else { return [] }
        var start = 0
        var out: [APIClient.TurnPart] = []
        // The answers aren't in `line` (she doesn't say them): they don't count
        for part in parts where !part.isAnswer {
            if !part.isEnglish, shown.map({ $0 > start }) ?? true { out.append(part) }
            start += part.text.count + 1
            // A word or question is followed in the line by its gloss, said (lib/beginner.ts)
            if let gloss = part.gloss, !gloss.isEmpty { start += gloss.count + 1 }
        }
        return out
    }

    /// Beginner dialogue: the answers to say back, on the learner's turn
    public var answersToSay: [APIClient.TurnPart] {
        guard let parts, sayIt == nil, [.tapToTalk, .listening, .hearing].contains(phase) else { return [] }
        return parts.filter(\.isAnswer)
    }

    /// Speed as on the web: slower with English on
    private var speed: Double { UserDefaults.standard.bool(forKey: SettingsKey.english) ? 0.7 : 0.9 }

    /// `beginner`: the learner's level is Beginner (for the opener hint)
    public init(city: City, place: Place, character: Character, language: Language, api: APIClient, beginner: Bool = false, onSave: @escaping (String) -> Void) {
        self.beginner = beginner
        self.city = city
        self.place = place
        self.character = character
        self.language = language
        self.api = api
        self.onSave = onSave
    }

    // MARK: - Flow

    /// Starts the conversation: entering the place is the deliberate action
    public func start() async {
        guard phase == .starting, line == nil else { return }
        observeInterruptions()
        do {
            try AudioSession.activate()
            let started = Self.now()
            let reply = try await requestTurn(learnerSaid: nil)
            time("opening", since: started)
            debug.promptVersion = reply.promptVersion
            conversationId = reply.conversationId
            await present(reply, generation: generation)
        } catch {
            fail(error, step: "start")
        }
    }

    /// Show and speak a line, then open the learner's turn
    private func present(_ reply: APIClient.TurnReply, generation: Int) async {
        guard generation == self.generation else { return }
        scaffolding = reply.replies == true
        // An older server sends no stage (or "tap", now gone): two good answers
        stage = scaffolding ? (reply.stage.flatMap(Stage.init(rawValue:)) ?? .read) : nil
        #if DEBUG
        // `-FuoriStage read|choose`: the answers panel for any learner, for
        // simulator checks without a new learner (the server still writes them)
        if let forced = UserDefaults.standard.string(forKey: "FuoriStage").flatMap(Stage.init(rawValue:)) {
            scaffolding = true
            stage = forced
        }
        #endif
        firstTime = scaffolding && !UserDefaults.standard.bool(forKey: Self.answersIntroduced)
        sayIt = nil
        if interrupted {
            // Something cut in while it was on its way: show it, don't say it,
            // and leave the learner on their turn with the mic closed
            interrupted = false
            line = reply.line
            english = reply.en
            parts = reply.parts
            shown = nil
            replies = nil
            chosen = nil
            writeReplies()
            await openTurn(micClosed: true)
            return
        }
        if let head {
            self.head = nil
            if reply.line.hasPrefix(head.text), await sayRest(of: reply, after: head, generation: generation) { return }
            // Not said (its voice failed) or not this line: the whole line, as usual
            head.task.cancel()
            voice.stop()
            guard generation == self.generation, [.speaking, .thinking, .starting].contains(phase) else { return }
        }
        line = reply.line
        english = reply.en
        parts = reply.parts
        shown = 0
        replies = nil
        chosen = nil
        writeReplies()
        phase = .speaking
        do {
            let started = Self.now()
            let audio = try await api.speak(text: reply.line, characterId: character.id, speed: speed)
            time("voice", since: started)
            debug.voice = "hosted (\(audio.count / 1024) KB)"
            guard generation == self.generation else { return }
            startReveal(reply.line)
            try await voice.play(audio)
        } catch {
            // The hosted voice failed: the phone's own voice says it instead
            guard generation == self.generation else { return }
            let code = report(error, step: "speak")
            debug.voice = "phone (hosted failed, \(code))"
            startReveal(reply.line)
            await voice.speak(reply.line, language: language.speechLang, rate: Float(speed))
        }
        finishReveal()
        guard generation == self.generation, phase == .speaking else { return }
        await openTurn()
    }

    // MARK: - The first sentence first (/v1/turn streamed; roadmap N4, speed)

    /// The line's first sentence, said while the rest of the reply is written
    private struct Head {
        /// Exactly as the line starts, with the space after it
        let text: String
        /// True once it has been said through
        let task: Task<Bool, Never>
    }
    private var head: Head?
    /// A turn request is on its way (a first sentence may start meanwhile)
    private var awaitingReply = false
    /// The learner tapped while the character spoke: the rest isn't said
    private var stoppedByTap = false

    /// POST /v1/turn, streamed: the first sentence starts being said as soon
    /// as it's written, and present() says the rest
    private func requestTurn(learnerSaid: String?) async throws -> APIClient.TurnReply {
        head = nil
        // A new turn: an interruption during an earlier one (whose reply then
        // failed) mustn't silence this reply
        interrupted = false
        awaitingReply = true
        defer { awaitingReply = false }
        let generation = self.generation
        return try await api.turnStreamed(cityId: city.id, placeId: place.id, conversationId: conversationId, learnerSaid: learnerSaid, speed: speed) { [weak self] first, parts in
            Task { @MainActor in self?.startHead(first, parts: parts, generation: generation) }
        }
    }

    /// `parts`: a Beginner turn's first parts, shown as bubbles while they're said
    private func startHead(_ first: String, parts headParts: [APIClient.TurnPart]? = nil, generation: Int) {
        // Only while still waiting for the reply: once it's here, present() says the whole line
        guard awaitingReply, head == nil, generation == self.generation, phase == .thinking || phase == .starting else { return }
        stoppedByTap = false
        let said = first.trimmingCharacters(in: .whitespacesAndNewlines)
        let task = Task { [weak self] () -> Bool in
            guard let self else { return false }
            do {
                let started = Self.now()
                let audio = try await self.api.speak(text: said, characterId: self.character.id, speed: self.speed)
                self.time("voice first", since: started)
                // Still sending, not interrupted meanwhile: only now does she
                // speak and her bubble appear. Switching on when the line was
                // written left an empty bubble and her wave for the second the
                // voice took (Josh's screenshot, Andrea, 2026-10-23)
                guard generation == self.generation, !self.interrupted, self.phase == .thinking || self.phase == .starting else { return false }
                // Her reply has begun: the last "Say this" is done with
                self.sayIt = nil
                self.line = first
                self.parts = headParts
                self.english = nil
                self.shown = 0
                self.replies = nil
                self.chosen = nil
                self.phase = .speaking
                self.startReveal(first)
                try await self.voice.play(audio)
                return generation == self.generation
            } catch {
                guard generation == self.generation else { return false }
                // present() says the whole line instead, the phone's voice if need be
                self.report(error, step: "speak")
                return false
            }
        }
        head = Head(text: first, task: task)
    }

    /// The reply has come while its first sentence is being said: say the
    /// rest once it finishes. False when the first sentence wasn't said, so
    /// present() says the whole line.
    private func sayRest(of reply: APIClient.TurnReply, after head: Head, generation: Int) async -> Bool {
        writeReplies()
        let after = reply.line.dropFirst(head.text.count)
        let offset = head.text.count + after.prefix(while: \.isWhitespace).count
        let rest = after.trimmingCharacters(in: .whitespacesAndNewlines)
        // The rest's voice was started on the server when the line was written
        let restAudio = Task { [api, character, speed] () -> Result<Data, Error>? in
            guard !rest.isEmpty else { return nil }
            do { return .success(try await api.speak(text: rest, characterId: character.id, speed: speed)) } catch { return .failure(error) }
        }
        let said = await head.task.value
        guard generation == self.generation else { restAudio.cancel(); return true }
        // The first sentence was never said (its voice failed, or it came too
        // late): present() says the whole line
        guard said || stoppedByTap else { restAudio.cancel(); return false }
        // The whole line now; what's been said of it stays shown
        line = reply.line
        english = reply.en
        parts = reply.parts
        parts = reply.parts
        replies = nil
        chosen = nil
        if stoppedByTap || phase != .speaking {
            restAudio.cancel()
            finishReveal()
            if phase == .speaking { await openTurn() }
            return true
        }
        switch await restAudio.value {
        case .success(let audio):
            guard generation == self.generation, phase == .speaking else { return true }
            debug.voice = "hosted, first sentence first"
            startReveal(rest, offset: offset)
            do { try await voice.play(audio) } catch {
                report(error, step: "speak")
                await voice.speak(rest, language: language.speechLang, rate: Float(speed))
            }
        case .failure(let error):
            guard generation == self.generation, phase == .speaking else { return true }
            let code = report(error, step: "speak")
            debug.voice = "phone for the rest (hosted failed, \(code))"
            startReveal(rest, offset: offset)
            await voice.speak(rest, language: language.speechLang, rate: Float(speed))
        case nil:
            break
        }
        finishReveal()
        guard generation == self.generation, phase == .speaking else { return true }
        await openTurn()
        return true
    }

    /// Types the line out in step with the voice (lib/speech/reveal.ts on the web)
    /// `offset`: where `text` starts in the line (the rest after a first sentence)
    private func startReveal(_ text: String, offset: Int = 0) {
        revealTask?.cancel()
        revealTask = Task { [weak self] in
            while !Task.isCancelled {
                guard let self else { return }
                let n = offset + Reveal.count(text, fraction: self.voice.progress)
                if n > (self.shown ?? 0) { self.shown = n }
                try? await Task.sleep(for: .milliseconds(33))
            }
        }
    }

    /// The whole line: speech ended, was interrupted, or failed
    private func finishReveal() {
        revealTask?.cancel()
        revealTask = nil
        shown = nil
    }

    /// The learner's turn: open the mic (or wait for a tap under VoiceOver)
    /// The generation whose startRecording is waiting for the mic (a pause
    /// moves on the generation, so a stale wait never blocks a new turn)
    private var openingMic: Int?

    /// `micClosed`: after an interruption the mic waits for a tap, hands-free too
    private func openTurn(micClosed: Bool = false) async {
        ring = 0
        if scaffolding, repliesTask != nil {
            // Under VoiceOver the answers are buttons: wait for a tap on one
            if isVoiceOverRunning {
                await showReplies()
                return
            }
            // Otherwise the answers fill the panel above the usual mic
            Task { await self.loadReplies() }
        }
        if tapMode || micClosed {
            phase = .tapToTalk
            return
        }
        await startRecording()
    }

    private func startRecording(firstWordWait wait: TimeInterval = 10) async {
        firstWordWait = wait
        resetEarly()
        // A second tap while the mic is still opening would start a second
        // recording and a second watcher; the orphaned watcher later finished
        // the turn again with the first file already deleted (TestFlight
        // 0.1.0 (1), "no such file" at step transcribe, 2026-10-19)
        guard openingMic != generation, listenTask == nil else { return }
        let opening = generation
        openingMic = opening
        defer { if openingMic == opening { openingMic = nil } }
        // The pill turns green at the tap, not when the mic is ready (Josh,
        // 2026-10-18: the tap should plainly register, so nobody taps twice)
        phase = .listening
        level = 0
        let allowed = await AudioSession.requestMicrophone()
        // Paused or left while the mic was opening: it stays closed
        guard opening == generation, phase == .listening else { return }
        guard allowed else {
            phase = .micDenied
            return
        }
        gate.reset()
        do {
            try recorder.start { [gate] level, time in gate.process(level: level, at: time) }
        } catch {
            fail(error, step: "record")
            return
        }
        turnStartedAt = ProcessInfo.processInfo.systemUptime
        phase = .listening
        let generation = self.generation
        listenTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(100))
                // Cancelled while asleep (the learner tapped send): the sleep
                // ends early and this must not tick once more. It did, and
                // set the circle back to "talking" after the send, so the
                // learner tapped again and that second send found the mic
                // already closed: "the mic wasn't on" (E-87MU and four more
                // on Josh's phone, 2026-10-23), the old "0 buffers failed"
                guard !Task.isCancelled, let self, generation == self.generation else { return }
                if self.tick() {
                    // Hand over to a task of its own: finishing the turn cancels
                    // this watcher, and must not cancel its own upload with it
                    self.listenTask = nil
                    Task { await self.finishTurn() }
                    return
                }
            }
        }
    }

    /// Ten times a second while the mic is open. Returns true when the
    /// learner's turn has ended and should be sent.
    private func tick() -> Bool {
        // Only while the mic is open: never move a sent turn back to "talking"
        guard phase == .listening || phase == .hearing else { return false }
        let snapshot = gate.snapshot()
        let now = ProcessInfo.processInfo.systemUptime
        level = snapshot.level
        if !endsOnSilence {
            // Under VoiceOver the learner ends the turn with a tap; no silence timer
            if snapshot.hasSpoken { phase = .hearing }
            return now - turnStartedAt >= longestTurn
        }
        guard snapshot.hasSpoken else {
            if now - turnStartedAt >= firstWordWait {
                // Nothing said: close the mic rather than keep listening to the
                // room; it's still their turn (docs/bottom-bar.md)
                interrupt()
            }
            return false
        }
        phase = .hearing
        if snapshot.silence < earlyAfter {
            // Talking again: what was sent early is out of date
            if early != nil { resetEarly() }
        } else if early == nil {
            startEarly()
        }
        ring = min(1, snapshot.silence / silenceTarget)
        return ring >= 1
    }

    // MARK: - Transcribing during the silence (2026-10-23, speed)

    /// After this much silence the turn so far is sent to speech to text, so
    /// its words are ready when the turn ends and their punctuation sets how
    /// long a silence ends it (EndOfTurn: sooner after a finished sentence,
    /// longer when it trails off)
    private let earlyAfter: TimeInterval = 0.6
    private var early: Task<APIClient.Heard?, Never>?
    private var earlyHeard: APIClient.Heard?
    private var silenceTarget: TimeInterval = EndOfTurn.usual

    private func resetEarly() {
        early?.cancel()
        early = nil
        earlyHeard = nil
        silenceTarget = EndOfTurn.usual
    }

    private func startEarly() {
        let wav = recorder.snapshotWAV()
        let mode: APIClient.TranscribeMode = sayIt != nil ? .target : .turn
        // A failure here costs nothing: the turn is transcribed as usual when
        // it ends, and that call reports its own errors
        let task = Task { [api] () -> APIClient.Heard? in
            try? await api.transcribeHeard(audio: wav, filename: "speech.wav", mimeType: "audio/wav", mode: mode)
        }
        early = task
        Task { [weak self] in
            let heard = await task.value
            guard let self, self.early == task, let heard else { return }
            self.earlyHeard = heard
            self.silenceTarget = EndOfTurn.silence(after: heard.text)
        }
    }

    /// A tap on the turn control: while the character speaks, stop them and
    /// open the learner's turn; during the turn, end it now; under VoiceOver,
    /// start and end it
    public func tapTurn() async {
        switch phase {
        case .speaking:
            stoppedByTap = true // a first sentence's rest isn't said either
            voice.stop() // present() then opens the learner's turn
        case .tapToTalk where line == nil && conversationId == nil:
            // The opening line failed: a tap tries again
            note = nil
            phase = .starting
            await start()
        case .tapToTalk, .micDenied: await startRecording()
        case .listening, .hearing: await finishTurn()
        default: break
        }
    }

    private func finishTurn() async {
        // Once per turn: the tap and the turn's time limit can both end it
        guard phase == .listening || phase == .hearing, openingMic != generation else { return }
        // Terracotta at the tap, before stopping the mic and reading the file
        // (Josh, 2026-10-18: the sent state shows on the send tap, not on the reply)
        phase = .thinking
        ring = 0
        level = 0
        listenTask?.cancel()
        listenTask = nil
        let generation = self.generation
        await Task.yield() // lets the pill redraw before the mic stops
        let wasRecording = recorder.isRecording
        let lastStop = recorder.lastStop
        let url = recorder.stop("finish")
        // Left in that moment: leave() already closed the mic
        guard generation == self.generation else { return }
        let snapshot = gate.snapshot()
        // The pill said listening but the mic wasn't on: something stopped it
        // first, or it never opened. Nothing was recorded, so the learner
        // says it again; the report says what stopped it (the "0 buffers
        // failed to write" errors on Josh's phone, 2026-10-21, cause unknown)
        guard wasRecording, let url else {
            let code = report(MicNotRecording(lastStop: lastStop, phases: phaseLog.text), step: "record")
            note = ErrorCode.message("The mic wasn't on. Say it again.", code: code)
            await openTurn()
            return
        }
        guard recorder.writeFailures == 0 else {
            let code = report(RecordingFailed(writeFailures: recorder.writeFailures), step: "record")
            note = ErrorCode.message("The recording didn't save. Try again.", code: code)
            await openTurn()
            return
        }
        guard snapshot.voiced >= minimumVoice else {
            note = "Didn't catch that."
            await openTurn()
            return
        }
        note = nil
        if showsAnswers { UserDefaults.standard.set(true, forKey: Self.answersIntroduced) }
        var step = "transcribe"
        do {
            let started = Self.now()
            // Reading a "Say this" line: it's in the language and goes to her,
            // with no language check (it looped back into say it whenever
            // Whisper called the reading English: Josh, Mohamed, 2026-10-23)
            let reading = sayIt != nil
            // Transcribed during the silence, with nothing said since: use it
            var fromSilence = earlyHeard
            if fromSilence == nil, let early { fromSilence = await early.value }
            let heard: APIClient.Heard
            if let fromSilence {
                try? FileManager.default.removeItem(at: url)
                heard = fromSilence
                debug.timings["end wait"] = Int(silenceTarget * 1000)
            } else {
                let audio = try Data(contentsOf: url)
                try? FileManager.default.removeItem(at: url)
                heard = try await api.transcribeHeard(audio: audio, mode: reading ? .target : .turn)
            }
            resetEarly()
            let said = heard.text
            time("transcribe", since: started)
            debug.heard = "(\(heard.language ?? "?")) \(said)"
            guard generation == self.generation else { return }
            // Speech to text heard no words ("...", "?"): not a turn
            guard Heard.hasWords(said) else {
                note = "Didn't catch that."
                await openTurn()
                return
            }
            // English: say it in English. The line in the language comes back
            // to read out loud, and the mic reopens for the reading
            if !reading, heard.language == "en" {
                step = "say-it"
                await sayItInEnglish(said, asLearned: heard.learned, generation: generation)
                return
            }
            step = "turn"
            try await sendTurn(said, generation: generation)
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: step)
        }
    }

    /// The learner's line to the character, and her reply
    private func sendTurn(_ said: String, generation: Int) async throws {
        let started = Self.now()
        let reply = try await requestTurn(learnerSaid: said)
        learnerLines += 1
        time("turn", since: started)
        debug.promptVersion = reply.promptVersion
        if let id = reply.conversationId { conversationId = id }
        await present(reply, generation: generation)
    }

    // MARK: - Say it in English (docs/beginner-scaffolding.md)

    /// The learner said it in English: show what they said and the line to
    /// read, then open the mic for the reading by itself (Josh, 2026-10-23:
    /// "circle back to green listening"). The reading goes to her as any turn
    /// `asLearned`: the same recording heard as the learned language, which
    /// goes to her instead when it was really the language (Whisper sometimes
    /// translates a learner's speech into English)
    private func sayItInEnglish(_ english: String, asLearned: String? = nil, generation: Int) async {
        do {
            let started = Self.now()
            let line = try await api.sayIt(cityId: city.id, placeId: place.id, conversationId: conversationId, heard: english, heardAsLearned: asLearned)
            time("say-it", since: started)
            guard generation == self.generation else { return }
            // Already in the language (Whisper mislabelled it) or too unclear
            // to tell: it goes to her as said. When in doubt, the character
            if line.sendAsSaid == true || line.line.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                let said = asLearned.flatMap { Heard.hasWords($0) ? $0 : nil } ?? english
                debug.heard = (debug.heard ?? "") + " → to her as said: \(said)"
                try await sendTurn(said, generation: generation)
                return
            }
            sayIt = SayIt(english: english, line: line.line, en: line.en)
            // Under VoiceOver the mic waits for a tap, as every turn does there
            if tapMode && !endsOnSilence {
                phase = .tapToTalk
                return
            }
            await startRecording(firstWordWait: readingWait)
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: sayIt == nil ? "say-it" : "turn")
        }
    }

    /// Hear it: the line said by the phone's own voice, not hers (it's the
    /// learner's line), with the mic closed while it plays; then the mic
    /// reopens for the reading
    public func hearLine() async {
        guard let sayIt, !hearingLine else { return }
        let wasListening = phase == .listening || phase == .hearing
        if wasListening {
            listenTask?.cancel()
            listenTask = nil
            if let url = recorder.stop("hear it") { try? FileManager.default.removeItem(at: url) }
        }
        let generation = self.generation
        hearingLine = true
        phase = .tapToTalk
        await voice.speak(sayIt.line, language: language.speechLang, rate: Float(speed))
        hearingLine = false
        guard generation == self.generation, self.sayIt == sayIt, phase == .tapToTalk else { return }
        if endsOnSilence { await startRecording(firstWordWait: readingWait) }
    }

    // MARK: - Reply buttons (scaffolding, docs/beginner-scaffolding.md)

    /// Starts writing the two replies to the line just received, in parallel
    /// with the voice, so they're usually ready when the character finishes.
    /// Only with the setting on; the server has recorded the line by now.
    private func writeReplies() {
        repliesTask?.cancel()
        repliesTask = nil
        guard scaffolding, let conversationId else { return }
        let started = Self.now()
        let stage = stage?.rawValue
        repliesTask = Task { [api, city, place] in
            do {
                let replies = try await api.replies(cityId: city.id, placeId: place.id, conversationId: conversationId, stage: stage)
                return .success(replies)
            } catch {
                return .failure(error)
            }
        }
        Task { [weak self] in
            guard let self, let task = self.repliesTask else { return }
            if case .success = await task.value { self.time("replies", since: started) }
        }
    }

    /// Set once the learner has answered with the panel for the first time
    static let answersIntroduced = "scaffold.answersIntroduced"

    /// The answers for the panel, once written, without changing the turn:
    /// the mic is already the learner's. If writing them failed, the turn
    /// goes on with the mic alone and says so.
    private func loadReplies() async {
        guard let task = repliesTask else { return }
        let generation = self.generation
        let result = await task.value
        guard generation == self.generation, repliesTask == task else { return }
        switch result {
        case .success(let written) where written.replies.count == 2:
            replies = written.replies
        case .success(let written):
            noReplies(APIError(code: .serverError, message: "Expected 2 replies, got \(written.replies.count)", retryable: false, status: 200))
        case .failure(let error):
            noReplies(error)
        }
    }

    private func noReplies(_ error: Error) {
        repliesTask = nil
        let code = report(error, step: "replies")
        note = ErrorCode.message("No suggestions this time. Answer in your own words.", code: code)
    }

    /// Under VoiceOver: the two answers as buttons, once written. If writing
    /// them failed, this turn falls back to the mic and says so.
    private func showReplies() async {
        phase = .choosing
        guard let task = repliesTask else { return }
        let generation = self.generation
        let result = await task.value
        guard generation == self.generation, phase == .choosing else { return }
        switch result {
        case .success(let written) where written.replies.count == 2:
            replies = written.replies
        case .success(let written):
            fallBackToMic(APIError(code: .serverError, message: "Expected 2 replies, got \(written.replies.count)", retryable: false, status: 200))
        case .failure(let error):
            fallBackToMic(error)
        }
    }

    private func fallBackToMic(_ error: Error) {
        repliesTask = nil
        let code = report(error, step: "replies")
        note = ErrorCode.message("No replies this time. Tap the mic to answer.", code: code)
        phase = .tapToTalk
    }

    /// A tap on an answer, where answers are buttons (VoiceOver, mic off):
    /// it goes to the character as if the learner had said it
    public func choose(_ reply: APIClient.ReplyOption) async {
        guard phase == .choosing || phase == .micDenied, replies?.contains(reply) == true else { return }
        chosen = reply
        note = nil
        UserDefaults.standard.set(true, forKey: Self.answersIntroduced)
        await sendChosen(reply, generation: generation, how: "tapped")
    }

    private func sendChosen(_ reply: APIClient.ReplyOption, generation: Int, how: String) async {
        phase = .thinking
        repliesTask = nil
        do {
            debug.heard = "(\(how)) \(reply.line)"
            let started = Self.now()
            let next = try await requestTurn(learnerSaid: reply.line)
            learnerLines += 1
            time("turn", since: started)
            debug.promptVersion = next.promptVersion
            if let id = next.conversationId { conversationId = id }
            await present(next, generation: generation)
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: "turn")
        }
    }

    // MARK: - Learn

    /// Lines the learner has sent in this conversation (spoken or tapped)
    public private(set) var learnerLines = 0

    /// The Learn link appears once there's something to go over: four of the
    /// learner's lines saved on the server (docs/learn.md → the Learn link;
    /// Josh, 2026-10-21: "I'd probably try 4 turns, not 2")
    public var hasSomethingToLearn: Bool { conversationId != nil && learnerLines >= 4 }

    /// The line the Learn sheet is saying aloud right now, for its sound wave
    public private(set) var learnSaying: String?

    /// The page for the conversation so far (POST /v1/learn)
    public func learnPage() async throws -> APIClient.LearnPage {
        guard let conversationId else { throw NoConversationYet() }
        let started = Self.now()
        defer { time("learn", since: started) }
        do {
            return try await api.learn(cityId: city.id, placeId: place.id, conversationId: conversationId)
        } catch {
            _ = report(error, step: "learn")
            throw error
        }
    }

    /// The Learn sheet opens over a stopped scene; closing it leaves the
    /// learner on their turn, so nothing speaks or listens until they tap
    public func openLearn() { interrupt() }

    /// Says a corrected line in the character's own voice (the phone's voice
    /// if the hosted one fails), as the scene does. Tapping again replays.
    public func sayForLearn(_ text: String) async {
        voice.stop()
        learnSaying = text
        do {
            let audio = try await api.speak(text: text, characterId: character.id, speed: speed)
            guard learnSaying == text else { return }
            try await voice.play(audio)
        } catch {
            guard learnSaying == text else { return }
            _ = report(error, step: "learn speak")
            await voice.speak(text, language: language.speechLang, rate: Float(speed))
        }
        if learnSaying == text { learnSaying = nil }
    }

    /// The sheet closed: stop its voice
    public func closeLearn() {
        learnSaying = nil
        voice.stop()
    }

    // MARK: - Interruptions, leave

    /// Something cut in (a call, Siri, AirPods out, the app in the background,
    /// the Learn sheet, no first word in hands-free): stop what was happening
    /// and leave the learner on their turn with the mic closed. No Pause or
    /// Resume (Josh, 2026-10-22, docs/bottom-bar.md).
    public func interrupt() {
        if awaitingReply || phase == .thinking || phase == .starting {
            // A line is on its way: stop any first sentence being said; the
            // reply is shown, not said, when it comes (present)
            interrupted = true
            head?.task.cancel()
            head = nil
            voice.stop()
            finishReveal()
            if phase == .speaking { phase = .thinking }
            return
        }
        // Already their turn with the mic closed: nothing to stop
        guard [.speaking, .listening, .hearing].contains(phase) else {
            voice.stop()
            return
        }
        generation += 1
        listenTask?.cancel()
        listenTask = nil
        recorder.stop("interrupt")
        voice.stop()
        finishReveal()
        ring = 0
        level = 0
        Task { await self.openTurn(micClosed: true) }
    }

    /// The learner leaves (back, swipe, or the app going to the background):
    /// stop everything and save what the character remembers
    public func leave() {
        generation += 1
        listenTask?.cancel()
        repliesTask?.cancel()
        recorder.stop("leave")
        voice.stop()
        for o in observers { NotificationCenter.default.removeObserver(o) }
        observers = []
        AudioSession.deactivate()
        if let conversationId { onSave(conversationId) }
    }

    /// The app went to the background: stop, and save in case it never comes back
    public func backgrounded() {
        interrupt()
        if let conversationId { onSave(conversationId) }
    }

    /// A step failed: its message shows above the circle and the learner is
    /// on their turn (docs/bottom-bar.md); before the opening line, a tap
    /// tries the opening again
    private func fail(_ error: Error, step: String) {
        listenTask?.cancel()
        listenTask = nil
        head?.task.cancel()
        head = nil
        recorder.stop("fail \(step)")
        voice.stop()
        finishReveal()
        let code = report(error, step: step)
        let message = (error as? APIError)?.message ?? error.localizedDescription
        note = ErrorCode.message(message, code: code)
        phase = .tapToTalk
    }

    /// Sends the error to the server log (/v1/log) and returns its code, the
    /// request's own when the server answered, so both sides match
    @discardableResult
    private func report(_ error: Error, step: String) -> String {
        let code = (error as? APIError)?.requestId ?? ErrorCode.make()
        let report = APIClient.ErrorReport(id: code, step: step, error: error, context: ["characterId": character.id, "placeId": place.id])
        debug.lastError = "\(code) \(step): \(report.message)"
        Task { [api] in await api.report(report) }
        return code
    }

    // MARK: - System events

    private var isVoiceOverRunning: Bool {
        #if canImport(UIKit)
        UIAccessibility.isVoiceOverRunning
        #else
        false
        #endif
    }

    /// Calls, Siri and headphones coming out leave the learner on their turn, mic closed
    private func observeInterruptions() {
        #if os(iOS)
        // Once per conversation (a retried opening calls start() again)
        guard observers.isEmpty else { return }
        let center = NotificationCenter.default
        observers.append(center.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
            let began = (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt) == AVAudioSession.InterruptionType.began.rawValue
            if began { MainActor.assumeIsolated { self?.interrupt() } }
        })
        observers.append(center.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { [weak self] note in
            let reason = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
            if reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue {
                MainActor.assumeIsolated { self?.interrupt() }
            }
        })
        #endif
    }
}


/// The voice gate shared between the audio thread (levels) and the main
/// actor (timing), behind a lock
final class GateBox: @unchecked Sendable {
    struct Snapshot { let hasSpoken: Bool; let silence: TimeInterval; let voiced: TimeInterval; let level: Double }

    private let lock = NSLock()
    private var gate = VoiceGate()
    private var lastLevel: Float = -160
    private var lastTime: TimeInterval = 0

    func reset() { lock.withLock { gate = VoiceGate(); lastLevel = -160 } }

    func process(level: Float, at time: TimeInterval) {
        lock.withLock {
            gate.process(level: level, at: time)
            lastLevel = level
            lastTime = time
        }
    }

    func snapshot() -> Snapshot {
        lock.withLock {
            // Silence measured on the audio clock, up to now
            let now = max(lastTime, AudioClock.now)
            return Snapshot(
                hasSpoken: gate.hasSpoken,
                silence: gate.silence(at: now),
                voiced: gate.voiced,
                level: Double(max(0, min(1, (lastLevel + 60) / 50)))
            )
        }
    }
}

/// The same clock the recorder's buffer times use
private enum AudioClock {
    static var now: TimeInterval { ProcessInfo.processInfo.systemUptime }
}

/// The recorder couldn't write some of the learner's audio to the file
struct RecordingFailed: Error, CustomStringConvertible {
    let writeFailures: Int
    var description: String { "Recording: \(writeFailures) buffers failed to write" }
}

/// A turn ended with the mic off. `lastStop` is what stopped the recorder
/// last and when; `phases` the last few phases, seconds before now.
struct MicNotRecording: Error, CustomStringConvertible {
    let lastStop: (reason: String, at: TimeInterval)?
    let phases: String
    var description: String {
        let stopped = lastStop.map { "\($0.reason), \(String(format: "%.1f", ProcessInfo.processInfo.systemUptime - $0.at)) s ago" } ?? "never started"
        return "Recording: the mic wasn't on at send (last stop: \(stopped); phases: \(phases))"
    }
}

/// The last few phases of a conversation with their times
struct PhaseLog {
    private var entries: [(phase: String, at: TimeInterval)] = []

    mutating func note(_ phase: ConversationModel.Phase) {
        entries.append((String(describing: phase), ProcessInfo.processInfo.systemUptime))
        if entries.count > 10 { entries.removeFirst() }
    }

    /// Oldest first: "listening -12.3s, thinking -0.1s"
    var text: String {
        let now = ProcessInfo.processInfo.systemUptime
        return entries.map { "\($0.phase) -\(String(format: "%.1f", now - $0.at))s" }.joined(separator: ", ")
    }
}

/// The Learn sheet was opened before the server had saved the conversation
private struct NoConversationYet: LocalizedError {
    var errorDescription: String? { "Say something first, then open Learn." }
}
