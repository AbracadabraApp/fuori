import Foundation
import Observation
import FuoriCore
import FuoriNetworking
import FuoriAudio
#if canImport(UIKit)
import UIKit
#endif

/// The greeter's onboarding (docs/onboarding-design.md → Current flow and
/// Engineering needs). One screen with steps:
///
///   welcome ─ "Not yet!" ──────────────→ beginner send-off → go → city list
///           └ "Yes, but I want to improve" → question → follow-up → send-off → go
///
/// Right after that first tap, before the paths split, she asks their name
/// (mic) and whether she should welcome a woman or a man (two buttons), then
/// welcomes them by name (docs/onboarding-design.md → Name and address). Only
/// while the server saves it (/v1/me addressOn) and sends her lines.
///
/// She always speaks the language being learned; English is only subtitles.
/// Her line types out as she speaks; the English and the controls appear only
/// when she has finished. The mic is always tap to talk here, even with
/// Hands-free on. A recording with no voice in it doesn't move her on; on the
/// follow-up, that's when its English appears. A failed call shows its code
/// with Try again, never a silent skip.
///
/// The orientation tour (docs/orientation-script.md; Josh, 2026-10-23), when
/// the server sends its lines, replaces that, steps 1–3 for now:
///
///   hello (name by mic) → gender (Benvenuto / Benvenuta) → level (three
///   buttons) → levelSet (Avanti) → city list
///
/// Each card: her line in the language and its English, a note in English,
/// and on steps 1 and 3 her question. No Skip and no step count (Josh).
@MainActor
@Observable
public final class OnboardingModel {
    public enum Step: Equatable {
        case welcome, askName, address, welcomed, beginnerSendOff, question, followUp, sendOff
        /// The orientation tour
        case hello, gender, level, levelSet, trip, sayIt, help, ready
    }

    /// Which way the first tap went: where she goes after the name and address
    public enum Path: Equatable { case beginner, speaker }

    public enum Phase: Equatable {
        /// She's speaking (or her line is being fetched)
        case speaking
        /// She has finished: the step's buttons or mic are shown
        case ready
        /// The learner is talking (mic open)
        case listening
        /// Sending what they said, waiting for her reply
        case thinking
        case micDenied
        case failed(String)
    }

    public enum Pose { case welcome, listen, talk, laugh }

    public private(set) var step: Step = .welcome
    public private(set) var phase: Phase = .speaking
    /// Her current line and its English
    public private(set) var line: String = ""
    public private(set) var english: String?
    /// Characters of `line` spoken so far; nil once it's all out
    public private(set) var shown: Int? = 0
    /// Whether this step's English is shown once she has finished (not on the follow-up, until a silence)
    public private(set) var englishAllowed = true
    /// A short note above the controls, e.g. "Didn't catch that."
    public private(set) var note: String?
    /// 0...1: the mic level while they talk
    public private(set) var level: Double = 0

    public let onboarding: Onboarding
    public let language: Language
    private let api: APIClient
    /// Onboarding finished: the level the learner starts at
    private let onFinish: (String) -> Void

    private let voice = Voice()
    private let recorder = Recorder()
    private let gate = GateBox()
    private var revealTask: Task<Void, Never>?
    private var levelTask: Task<Void, Never>?
    /// What they said on the speaker path, for the follow-up and the send-off
    private var answers: [APIClient.Heard] = []
    /// The level from the send-off, applied when they tap go
    private var placedLevel = "beginner"
    /// Her name and address lines, or nil when the server doesn't save the choice
    public let addressLines: Onboarding.AddressLines?
    /// The name as heard; nil if they skipped it
    public private(set) var name: String?
    /// The orientation tour's lines, or nil for today's onboarding
    public let orientation: Onboarding.Orientation?
    /// The tour's card: her line, its English and the note
    public private(set) var card: Onboarding.Card?
    /// The tour's question under the card (her name, the level), or nil
    public private(set) var question: Onboarding.Card?
    /// The level they picked on step 3
    public private(set) var chosenLevel: String?
    private var path: Path = .beginner
    /// Bumped when something stops the current step; late results are dropped
    private var generation = 0
    /// stop() ran since her last line started
    private var wasStopped = false
    /// What to retry after a failure
    private var retry: (() async -> Void)?

    /// Less than this much voice isn't an answer (a cough, a click)
    private let minimumVoice: TimeInterval = 0.25
    /// A turn can't run longer than this, in case the second tap never comes
    private let longestAnswer: TimeInterval = 90

    /// Silence ends the answer, as in the game, except under VoiceOver, where
    /// a tap ends it (the screen reader's own voice would keep it open). A tap
    /// still sends at any time. Before 2026-10-24 onboarding waited for a
    /// second tap while the game ended on silence (Josh: "tap to say it, not
    /// tap it twice")
    public var endsOnSilence: Bool {
        #if canImport(UIKit)
        !UIAccessibility.isVoiceOverRunning
        #else
        true
        #endif
    }
    /// Her speed: full speed (Josh, 2026-10-23: "way too low key - she should
    /// read at full speed"; it was 0.8)
    private let speed = 1.0

    /// - askAddress: the server saves how characters address them (/v1/me addressOn)
    public init(onboarding: Onboarding, language: Language, api: APIClient, askAddress: Bool = false, onFinish: @escaping (String) -> Void) {
        self.onboarding = onboarding
        self.addressLines = askAddress ? onboarding.lines.addressLines : nil
        self.orientation = onboarding.orientation
        self.language = language
        self.api = api
        self.onFinish = onFinish
    }

    /// Which picture of her: welcome while she asks, listening while the mic
    /// is open, talking for her questions, laughing for the send-offs
    public var pose: Pose {
        if phase == .listening { return .listen }
        switch step {
        case .welcome, .hello: return .welcome
        case .askName, .address, .question, .followUp, .gender, .level: return .talk
        case .welcomed, .beginnerSendOff, .sendOff, .levelSet, .trip, .ready: return .laugh
        case .sayIt, .help: return .talk
        }
    }

    public var poseURL: URL? {
        switch pose {
        case .welcome: onboarding.guide.poses.welcome
        case .listen: onboarding.guide.poses.listen
        case .talk: onboarding.guide.poses.talk
        case .laugh: onboarding.guide.poses.laugh
        }
    }

    /// The English under her line: only once she has finished, and on the
    /// follow-up only after a silence
    public var shownEnglish: String? {
        guard shown == nil, englishAllowed, phase != .speaking else { return nil }
        return english
    }

    // MARK: - Flow

    public func start() async {
        guard step == .welcome, line.isEmpty else { return }
        if let orientation {
            step = .hello
            await sayCard(orientation.hello, question: orientation.askName)
            return
        }
        await say(onboarding.lines.welcome, englishAllowed: true)
    }

    // MARK: - The orientation tour

    /// A card: she says her line and the question; the English and the note
    /// show when she has finished
    private func sayCard(_ card: Onboarding.Card, question: Onboarding.Card?) async {
        self.card = card
        self.question = question
        await say(Onboarding.Line(line: Self.spoken(card, question: question, extra: extraSpoken), en: ""), englishAllowed: true)
    }

    /// The card read aloud in her voice (Josh, 2026-10-23: "all dialogue read
    /// … not buttons", then "the translations don't need to be read"): her
    /// line in the language, the note in English, her question in the
    /// language, then anything else on the card (card 5's example, card 6's
    /// Learn book). The English translations under her lines are shown, not read
    nonisolated static func spoken(_ card: Onboarding.Card, question: Onboarding.Card?, extra: [String] = []) -> String {
        let parts = [card.line, card.note, question?.line].compactMap { $0 } + extra
        return parts
            .map { $0.replacingOccurrences(of: "*", with: "").trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
            .map { ".!?:".contains($0.last ?? ".") ? $0 : $0 + "." }
            .joined(separator: " ")
    }

    /// What else card 5 and card 6 show, to be read with them
    private var extraSpoken: [String] {
        guard let o = orientation else { return [] }
        switch step {
        case .sayIt: return [o.sayItExample?.en, o.sayItExample?.line].compactMap { $0 }
        case .help: return [o.learn].compactMap { $0 }
        default: return []
        }
    }

    /// Step 1 with the mic off: on without a name
    public func continueWithoutName() async {
        guard step == .hello, phase == .ready || phase == .micDenied, let orientation else { return }
        name = nil
        step = .gender
        await sayCard(orientation.niceToMeet.named(nil), question: nil)
    }

    /// Step 2: how characters address them, then her welcome and the level question
    public func chooseGender(woman: Bool) async {
        guard step == .gender, phase == .ready, let orientation else { return }
        phase = .thinking
        do {
            try await api.onboardingAddress(addressedAs: woman ? "f" : "m", name: name)
        } catch let error as APIError where error.code == .notFound {
            report(error, step: "onboarding address off")
        } catch {
            fail(error, step: "onboarding address") { [weak self] in
                self?.phase = .ready
                await self?.chooseGender(woman: woman)
            }
            return
        }
        step = .level
        await sayCard((woman ? orientation.welcomeWoman : orientation.welcomeMan).named(name), question: orientation.askLevel)
    }

    /// Step 3: the level they pick is their level, in Settings too (Josh, 2026-10-23)
    public func chooseLevel(_ level: String) async {
        guard step == .level, phase == .ready, let orientation else { return }
        phase = .thinking
        do {
            try await api.onboardingLevel(level)
        } catch {
            fail(error, step: "onboarding level") { [weak self] in
                self?.phase = .ready
                await self?.chooseLevel(level)
            }
            return
        }
        chosenLevel = level
        // Card 4 opens with Perfetto!; an older server has only the old Perfetto! card
        if let trip = orientation.trip {
            step = .trip
            await sayCard(trip, question: nil)
        } else {
            step = .levelSet
            await sayCard(orientation.levelSet, question: nil)
        }
    }

    /// Avanti on cards 4–6, Andiamo! on card 7 (the city list)
    public func advance() async {
        guard phase == .ready, let o = orientation else { return }
        switch step {
        case .trip:
            if let sayIt = o.sayIt { step = .sayIt; await sayCard(sayIt, question: nil) } else { finish(o) }
        case .sayIt:
            if let help = o.help { step = .help; await sayCard(help, question: nil) } else { finish(o) }
        case .help:
            if let ready = o.ready { step = .ready; await sayCard(ready.named(name), question: nil) } else { finish(o) }
        case .ready, .levelSet:
            finish(o)
        default:
            break
        }
    }

    private func finish(_ o: Onboarding.Orientation) {
        stopAudio()
        onFinish(chosenLevel ?? "beginner")
    }

    /// Card 5's example line, played as the game plays a "Say this" line:
    /// the phone's own voice
    public func playExample() async {
        guard step == .sayIt, let line = orientation?.sayItExample?.line else { return }
        voice.stop()
        await voice.speak(line, language: language.speechLang, rate: Float(speed))
    }

    /// "Not yet!": the beginner send-off, no speaking on this path
    public func chooseNotYet() async {
        guard step == .welcome, phase == .ready else { return }
        await choose(.beginner)
    }

    /// "Yes, but I want to improve": her open question, answered by speaking
    public func chooseSome() async {
        guard step == .welcome, phase == .ready else { return }
        await choose(.speaker)
    }

    /// The first tap: her name question first, when the server saves the
    /// answer; then the path
    private func choose(_ path: Path) async {
        self.path = path
        if let addressLines {
            step = .askName
            await say(addressLines.askName, englishAllowed: true)
        } else {
            await go()
        }
    }

    /// The path the first tap chose
    private func go() async {
        switch path {
        case .beginner:
            step = .beginnerSendOff
            placedLevel = "beginner"
            await say(onboarding.lines.beginnerSendOff, englishAllowed: true)
        case .speaker:
            step = .question
            await say(onboarding.lines.question, englishAllowed: true)
        }
    }

    // MARK: - Name and address

    /// No name (they'd rather not, or the mic is off): she asks the address without it
    public func skipName() async {
        guard step == .askName, phase == .ready || phase == .micDenied, let addressLines else { return }
        name = nil
        step = .address
        await say(addressLines.address.named(nil), englishAllowed: true)
    }

    /// Woman or man: saved for every character, then her welcome by name and on
    /// down the path. While the server has it off (404) the step is skipped and
    /// logged; any other failure shows Try again.
    public func chooseAddress(woman: Bool) async {
        guard step == .address, phase == .ready, let addressLines else { return }
        phase = .thinking
        do {
            try await api.onboardingAddress(addressedAs: woman ? "f" : "m", name: name)
        } catch let error as APIError where error.code == .notFound {
            report(error, step: "onboarding address off")
        } catch {
            fail(error, step: "onboarding address") { [weak self] in
                self?.phase = .ready
                await self?.chooseAddress(woman: woman)
            }
            return
        }
        step = .welcomed
        await say((woman ? addressLines.welcomeWoman : addressLines.welcomeMan).named(name), englishAllowed: true)
        // Stopped while she spoke (backgrounded): wait for the go button instead
        guard step == .welcomed, phase == .ready, !wasStopped else { return }
        await go()
    }

    /// The go button after her welcome, if she was stopped before moving on
    public func continueAfterWelcome() async {
        guard step == .welcomed, phase == .ready else { return }
        await go()
    }

    /// The name as heard, without the full stop Whisper adds
    static func cleanName(_ text: String) -> String {
        text.trimmingCharacters(in: .whitespacesAndNewlines.union(.punctuationCharacters))
    }

    /// The go button after either send-off. The beginner path tells the
    /// server here; the speaker path's level was stored with the send-off.
    public func finish() async {
        guard step == .beginnerSendOff || step == .sendOff, phase == .ready else { return }
        if step == .beginnerSendOff {
            phase = .thinking
            do {
                try await api.onboardingDone()
            } catch {
                fail(error, step: "onboarding done") { [weak self] in
                    self?.phase = .ready
                    await self?.finish()
                }
                return
            }
        }
        stopAudio()
        onFinish(placedLevel)
    }

    /// The mic: a tap opens it (iOS asks for permission the first time); a
    /// silence sends the answer, or a second tap sends it sooner
    public func tapMic() async {
        switch phase {
        case .ready, .micDenied: await startRecording()
        case .speaking where step == .hello:
            // Card 1 shows the mic while she speaks: a tap stops her and opens it
            stopAudio()
            await startRecording()
        case .listening: await finishAnswer()
        default: break
        }
    }

    /// Try again after a failed call
    public func tryAgain() async {
        guard case .failed = phase, let retry else { return }
        self.retry = nil
        note = nil
        await retry()
    }

    /// The app went to the background, or the screen went away: stop her
    /// voice and the mic, and wait at this step's controls
    public func stop() {
        wasStopped = true
        generation += 1
        levelTask?.cancel()
        _ = recorder.stop("onboarding stop")
        stopAudio()
        level = 0
        if phase == .speaking || phase == .listening { phase = .ready }
    }

    // MARK: - Her lines

    private func say(_ said: Onboarding.Line, englishAllowed: Bool) async {
        wasStopped = false
        generation += 1
        let generation = self.generation
        line = said.line
        english = said.en
        self.englishAllowed = englishAllowed
        note = nil
        shown = 0
        phase = .speaking
        do {
            try AudioSession.activate()
            let audio = try await api.speak(text: said.line, characterId: onboarding.guide.id, speed: speed)
            guard generation == self.generation else { return }
            startReveal(said.line)
            try await voice.play(audio)
        } catch {
            // Her hosted voice failed: the phone's own voice says it instead
            guard generation == self.generation else { return }
            report(error, step: "onboarding speak")
            startReveal(said.line)
            await voice.speak(said.line, language: language.speechLang, rate: Float(speed))
        }
        guard generation == self.generation else { return }
        revealTask?.cancel()
        shown = nil
        if phase == .speaking { phase = .ready }
    }

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

    private func stopAudio() {
        revealTask?.cancel()
        voice.stop()
        if shown != nil { shown = nil }
    }

    // MARK: - Their answers

    private func startRecording() async {
        guard [.askName, .address, .question, .followUp, .hello, .gender].contains(step) else { return }
        guard await AudioSession.requestMicrophone() else {
            phase = .micDenied
            return
        }
        gate.reset()
        do {
            try recorder.start { [gate] level, time in gate.process(level: level, at: time) }
        } catch {
            fail(error, step: "onboarding record") { [weak self] in await self?.startRecording() }
            return
        }
        note = nil
        phase = .listening
        let started = ProcessInfo.processInfo.systemUptime
        let generation = self.generation
        levelTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(100))
                guard let self, generation == self.generation, self.phase == .listening else { return }
                let snapshot = self.gate.snapshot()
                self.level = snapshot.level
                let silenceEnded = self.endsOnSilence && snapshot.hasSpoken && snapshot.silence >= EndOfTurn.usual
                if silenceEnded || ProcessInfo.processInfo.systemUptime - started >= self.longestAnswer {
                    self.levelTask = nil
                    Task { await self.finishAnswer() }
                    return
                }
            }
        }
    }

    private func finishAnswer() async {
        guard phase == .listening else { return }
        levelTask?.cancel()
        levelTask = nil
        let url = recorder.stop("onboarding finish")
        let snapshot = gate.snapshot()
        level = 0
        guard recorder.writeFailures == 0, let url else {
            let code = report(RecordingFailed(writeFailures: recorder.writeFailures), step: "onboarding record")
            note = ErrorCode.message("The recording didn't save. Try again.", code: code)
            phase = .ready
            return
        }
        guard snapshot.voiced >= minimumVoice else {
            notHeard()
            return
        }
        phase = .thinking
        let audio: Data
        do {
            audio = try Data(contentsOf: url)
            try? FileManager.default.removeItem(at: url)
        } catch {
            fail(error, step: "onboarding record") { [weak self] in self?.phase = .ready }
            return
        }
        await send(audio)
    }

    /// Nothing said: she doesn't move on. On the follow-up, its English appears.
    private func notHeard() {
        note = "Didn't catch that."
        if step == .followUp { englishAllowed = true }
        phase = .ready
    }

    private func send(_ audio: Data) async {
        let generation = self.generation
        let heard: APIClient.Heard
        do {
            heard = try await api.transcribeHeard(audio: audio, mode: .any)
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: "onboarding transcribe") { [weak self] in await self?.send(audio) }
            return
        }
        guard generation == self.generation else { return }
        guard Heard.hasWords(heard.text) else {
            notHeard()
            return
        }
        await reply(to: heard)
    }

    /// Her reply to an answer: the follow-up after the first, the send-off after the second
    private func reply(to heard: APIClient.Heard) async {
        let generation = self.generation
        // The tour's step 1 (or saying the name again on step 2): just the name, then step 2
        if step == .hello || step == .gender, let orientation {
            do {
                name = try await api.onboardingName(heard: heard.text).name
            } catch {
                report(error, step: "onboarding name")
                name = Self.cleanName(heard.text)
            }
            guard generation == self.generation else { return }
            step = .gender
            await sayCard(orientation.niceToMeet.named(name), question: nil)
            return
        }
        if step == .askName || step == .address, let addressLines {
            // Her line says just the name ("My name is Josh" → "Josh", Josh
            // 2026-10-22: she said back the whole sentence); saying it again
            // (the mic on the address step) replaces it. If the server can't
            // pick it out, the whole answer, cleaned, rather than stop here
            do {
                name = try await api.onboardingName(heard: heard.text).name
            } catch {
                report(error, step: "onboarding name")
                name = Self.cleanName(heard.text)
            }
            guard generation == self.generation else { return }
            step = .address
            await say(addressLines.address.named(name), englishAllowed: true)
            return
        }
        do {
            if step == .question {
                let followUp = try await api.onboardingFollowUp(answer: heard)
                guard generation == self.generation else { return }
                answers = [heard]
                step = .followUp
                await say(Onboarding.Line(line: followUp.line, en: followUp.en), englishAllowed: false)
            } else if step == .followUp {
                let sendOff = try await api.onboardingSendOff(answers: answers + [heard])
                guard generation == self.generation else { return }
                answers.append(heard)
                placedLevel = sendOff.level
                step = .sendOff
                await say(Onboarding.Line(line: sendOff.line, en: sendOff.en), englishAllowed: true)
            }
        } catch {
            guard generation == self.generation else { return }
            fail(error, step: step == .question ? "onboarding follow-up" : "onboarding send-off") { [weak self] in
                self?.phase = .thinking
                await self?.reply(to: heard)
            }
        }
    }

    // MARK: - Errors

    private func fail(_ error: Error, step: String, retry: @escaping () async -> Void) {
        let code = report(error, step: step)
        let message = (error as? APIError)?.message ?? error.localizedDescription
        self.retry = retry
        phase = .failed(ErrorCode.message(message, code: code))
    }

    /// Sends the error to the server log (/v1/log) and returns its code
    @discardableResult
    private func report(_ error: Error, step: String) -> String {
        let code = (error as? APIError)?.requestId ?? ErrorCode.make()
        let report = APIClient.ErrorReport(id: code, step: step, error: error, context: ["onboardingStep": "\(self.step)"])
        Task { [api] in await api.report(report) }
        return code
    }
}
