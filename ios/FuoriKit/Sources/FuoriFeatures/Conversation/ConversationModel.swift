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

/// One hands-free conversation (docs/12-native-app.md → Audio pipeline):
/// the character speaks, the mic opens for the learner's turn, the turn ends
/// after a silence, the reply comes back and is spoken, and so on. The mic is
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
        /// VoiceOver is on: the mic opens on a tap (so it doesn't record VoiceOver's own voice)
        case tapToTalk
        case paused
        case micDenied
        case failed(String)
    }

    public private(set) var phase: Phase = .starting
    /// The character's current line and its English
    public private(set) var line: String?
    public private(set) var english: String?
    /// 0...1: how far the end-of-turn silence has run
    public private(set) var ring: Double = 0
    /// 0...1: the mic level, for the listening dots
    public private(set) var level: Double = 0
    /// A short note under the subtitles, e.g. when nothing was heard
    public private(set) var note: String?
    public private(set) var conversationId: String?

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

    /// Waits (Josh, 2026-10-15): 10 s for the first word, the turn ends after
    /// 4 s of silence; "more time to answer" gives 8 s and no first-word limit
    private var moreTime: Bool { UserDefaults.standard.bool(forKey: SettingsKey.moreTime) }
    private var firstWordWait: TimeInterval? { moreTime ? nil : 10 }
    private var endOfTurnWait: TimeInterval { moreTime ? 8 : 4 }
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
            let reply = try await api.turn(cityId: city.id, placeId: place.id)
            conversationId = reply.conversationId
            await present(reply, generation: generation)
        } catch {
            fail(error)
        }
    }

    /// Show and speak a line, then open the learner's turn
    private func present(_ reply: APIClient.TurnReply, generation: Int) async {
        guard generation == self.generation else { return }
        if phase == .paused { pendingReply = reply; line = reply.line; english = reply.en; return }
        line = reply.line
        english = reply.en
        phase = .speaking
        do {
            let audio = try await api.speak(text: reply.line, characterId: character.id, speed: speed)
            guard generation == self.generation else { return }
            try await voice.play(audio)
        } catch {
            // The hosted voice failed: the phone's own voice says it instead
            guard generation == self.generation else { return }
            await voice.speak(reply.line, language: language.speechLang, rate: Float(speed))
        }
        guard generation == self.generation, phase == .speaking else { return }
        await openTurn()
    }

    /// The learner's turn: open the mic (or wait for a tap under VoiceOver)
    private func openTurn() async {
        // Paused while thinking: the mic stays closed until a tap
        guard phase != .paused else { return }
        ring = 0
        if isVoiceOverRunning {
            phase = .tapToTalk
            return
        }
        await startRecording()
    }

    private func startRecording() async {
        guard await AudioSession.requestMicrophone() else {
            phase = .micDenied
            return
        }
        gate.reset()
        do {
            try recorder.start { [gate] level, time in gate.process(level: level, at: time) }
        } catch {
            fail(error)
            return
        }
        turnStartedAt = ProcessInfo.processInfo.systemUptime
        phase = .listening
        let generation = self.generation
        listenTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(100))
                guard let self, generation == self.generation else { return }
                if await self.tick() { return }
            }
        }
    }

    /// Ten times a second while the mic is open. Returns true when the turn is over.
    private func tick() async -> Bool {
        let snapshot = gate.snapshot()
        let now = ProcessInfo.processInfo.systemUptime
        level = snapshot.level
        guard snapshot.hasSpoken else {
            if let wait = firstWordWait, now - turnStartedAt >= wait {
                // Nothing said: pause rather than keep listening to the room
                pause()
                return true
            }
            return false
        }
        phase = .hearing
        ring = min(1, snapshot.silence / endOfTurnWait)
        if ring >= 1 {
            await finishTurn()
            return true
        }
        return false
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
        listenTask?.cancel()
        listenTask = nil
        let url = recorder.stop()
        let snapshot = gate.snapshot()
        ring = 0
        level = 0
        guard recorder.writeFailures == 0, let url else {
            note = "The recording didn't save. Try again."
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
        do {
            let audio = try Data(contentsOf: url)
            try? FileManager.default.removeItem(at: url)
            let said = try await api.transcribe(audio: audio)
            guard generation == self.generation else { return }
            guard !said.isEmpty else {
                note = "Didn't catch that."
                await openTurn()
                return
            }
            let reply = try await api.turn(cityId: city.id, placeId: place.id, conversationId: conversationId, learnerSaid: said)
            if let id = reply.conversationId { conversationId = id }
            await present(reply, generation: generation)
        } catch {
            guard generation == self.generation else { return }
            fail(error)
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
        ring = 0
        level = 0
        phase = .paused
    }

    public func resume() async {
        guard phase == .paused || phase.isFailed else { return }
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

    private func fail(_ error: Error) {
        listenTask?.cancel()
        recorder.stop()
        let message = (error as? APIError)?.message ?? error.localizedDescription
        phase = .failed(message)
    }

    // MARK: - System events

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
private final class GateBox: @unchecked Sendable {
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
