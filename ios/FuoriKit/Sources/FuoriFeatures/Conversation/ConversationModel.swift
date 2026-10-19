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
        case paused
        case micDenied
        case failed(String)
    }

    public private(set) var phase: Phase = .starting
    /// The character's current line and its English
    public private(set) var line: String?
    public private(set) var english: String?
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
    /// A reply that arrived while paused, played on resume
    private var pendingReply: APIClient.TurnReply?
    private var observers: [NSObjectProtocol] = []

    /// Hands-free waits (Josh, 2026-10-15): 10 s for the first word, the turn
    /// ends after 4 s of silence. No "more time to answer" setting (Josh,
    /// 2026-10-16: confusing); tap to talk, the default, has no timer at all.
    /// Tap to talk (the default) unless Hands-free is on; always under VoiceOver
    public var tapMode: Bool { isVoiceOverRunning || !UserDefaults.standard.bool(forKey: SettingsKey.handsFree) }
    /// Tap mode: a turn can't run longer than this, in case the second tap never comes
    private let longestTurn: TimeInterval = 90
    private let firstWordWait: TimeInterval? = 10
    private let endOfTurnWait: TimeInterval = 4
    /// Less than this much voice isn't a turn (a cough, a click)
    private let minimumVoice: TimeInterval = 0.25

    /// Speed as on the web: slower with English on
    private var speed: Double { UserDefaults.standard.bool(forKey: SettingsKey.english) ? 0.7 : 0.9 }

    public init(city: City, place: Place, character: Character, language: Language, api: APIClient, onSave: @escaping (String) -> Void) {
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
            let reply = try await api.turn(cityId: city.id, placeId: place.id)
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
        if phase == .paused { pendingReply = reply; line = reply.line; english = reply.en; shown = nil; return }
        line = reply.line
        english = reply.en
        shown = 0
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

    /// Types the line out in step with the voice (lib/speech/reveal.ts on the web)
    private func startReveal(_ text: String) {
        revealTask?.cancel()
        revealTask = Task { [weak self] in
            while !Task.isCancelled {
                guard let self else { return }
                let n = Reveal.count(text, fraction: self.voice.progress)
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

    private func openTurn() async {
        // Paused while thinking: the mic stays closed until a tap
        guard phase != .paused else { return }
        ring = 0
        if tapMode {
            phase = .tapToTalk
            return
        }
        await startRecording()
    }

    private func startRecording() async {
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
                guard let self, generation == self.generation else { return }
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
        let snapshot = gate.snapshot()
        let now = ProcessInfo.processInfo.systemUptime
        level = snapshot.level
        if tapMode {
            // The learner ends the turn with a tap; no silence timer
            if snapshot.hasSpoken { phase = .hearing }
            return now - turnStartedAt >= longestTurn
        }
        guard snapshot.hasSpoken else {
            if let wait = firstWordWait, now - turnStartedAt >= wait {
                // Nothing said: pause rather than keep listening to the room
                pause()
            }
            return false
        }
        phase = .hearing
        ring = min(1, snapshot.silence / endOfTurnWait)
        return ring >= 1
    }

    /// A tap on the turn control: while the character speaks, stop them and
    /// open the learner's turn; during the turn, end it now; under VoiceOver,
    /// start and end it
    public func tapTurn() async {
        switch phase {
        case .speaking: voice.stop() // present() then opens the learner's turn
        case .tapToTalk: await startRecording()
        case .listening, .hearing: await finishTurn()
        default: break
        }
    }

    private func finishTurn() async {
        // Once per turn: the tap and the turn's time limit can both end it
        guard phase == .listening || phase == .hearing, openingMic != generation else { return }
        listenTask?.cancel()
        listenTask = nil
        let url = recorder.stop()
        let snapshot = gate.snapshot()
        ring = 0
        level = 0
        guard recorder.writeFailures == 0, let url else {
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
        phase = .thinking
        let generation = self.generation
        var step = "transcribe"
        do {
            let audio = try Data(contentsOf: url)
            try? FileManager.default.removeItem(at: url)
            var started = Self.now()
            let said = try await api.transcribe(audio: audio)
            time("transcribe", since: started)
            debug.heard = said
            guard generation == self.generation else { return }
            // Speech to text heard no words ("...", "?"): not a turn
            guard Heard.hasWords(said) else {
                note = "Didn't catch that."
                await openTurn()
                return
            }
            step = "turn"
            started = Self.now()
            let reply = try await api.turn(cityId: city.id, placeId: place.id, conversationId: conversationId, learnerSaid: said)
            time("turn", since: started)
            debug.promptVersion = reply.promptVersion
            if let id = reply.conversationId { conversationId = id }
            await present(reply, generation: generation)
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: step)
        }
    }

    // MARK: - Typed reply (accessibility only, docs/13-ios-conventions.md D6)

    /// Typing is offered only when the mic is off for Fuori or VoiceOver or
    /// Switch Control is running; speaking stays the way to play
    public var canType: Bool {
        guard phase == .tapToTalk || phase == .micDenied else { return false }
        return phase == .micDenied || isVoiceOverRunning || isSwitchControlRunning
    }

    /// A typed reply goes to the character the same way a spoken one does
    public func send(typed text: String) async {
        let said = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard canType, Heard.hasWords(said) else { return }
        note = nil
        phase = .thinking
        let generation = self.generation
        do {
            debug.heard = "(typed) \(said)"
            let started = Self.now()
            let reply = try await api.turn(cityId: city.id, placeId: place.id, conversationId: conversationId, learnerSaid: said)
            time("turn", since: started)
            debug.promptVersion = reply.promptVersion
            if let id = reply.conversationId { conversationId = id }
            await present(reply, generation: generation)
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: "turn")
        }
    }

    // MARK: - Pause, resume, leave

    /// Stops the voice and the mic. Only a tap resumes.
    public func pause() {
        guard phase != .paused else { return }
        if phase == .thinking {
            // The learner's line is already on its way: let the reply arrive
            // and keep it (pendingReply) until they tap to resume
            phase = .paused
            return
        }
        generation += 1
        listenTask?.cancel()
        listenTask = nil
        recorder.stop()
        voice.stop()
        finishReveal()
        ring = 0
        level = 0
        phase = .paused
    }

    public func resume() async {
        guard phase == .paused || phase.isFailed || phase == .micDenied else { return }
        note = nil
        generation += 1
        if let reply = pendingReply {
            pendingReply = nil
            phase = .starting
            await present(reply, generation: generation)
        } else if line == nil {
            phase = .starting
            await start()
        } else {
            await openTurn()
        }
    }

    /// The learner leaves (back, swipe, or the app going to the background):
    /// stop everything and save what the character remembers
    public func leave() {
        generation += 1
        listenTask?.cancel()
        recorder.stop()
        voice.stop()
        for o in observers { NotificationCenter.default.removeObserver(o) }
        observers = []
        AudioSession.deactivate()
        if let conversationId { onSave(conversationId) }
    }

    /// The app went to the background: pause, and save in case it never comes back
    public func backgrounded() {
        pause()
        if let conversationId { onSave(conversationId) }
    }

    private func fail(_ error: Error, step: String) {
        listenTask?.cancel()
        recorder.stop()
        let code = report(error, step: step)
        let message = (error as? APIError)?.message ?? error.localizedDescription
        phase = .failed(ErrorCode.message(message, code: code))
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

    private var isSwitchControlRunning: Bool {
        #if canImport(UIKit)
        UIAccessibility.isSwitchControlRunning
        #else
        false
        #endif
    }

    private var isVoiceOverRunning: Bool {
        #if canImport(UIKit)
        UIAccessibility.isVoiceOverRunning
        #else
        false
        #endif
    }

    /// Calls, Siri and headphones coming out pause; nothing resumes by itself
    private func observeInterruptions() {
        #if os(iOS)
        let center = NotificationCenter.default
        observers.append(center.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
            let began = (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt) == AVAudioSession.InterruptionType.began.rawValue
            if began { MainActor.assumeIsolated { self?.pause() } }
        })
        observers.append(center.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { [weak self] note in
            let reason = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
            if reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue {
                MainActor.assumeIsolated { self?.pause() }
            }
        })
        #endif
    }
}

extension ConversationModel.Phase {
    var isFailed: Bool { if case .failed = self { true } else { false } }
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
