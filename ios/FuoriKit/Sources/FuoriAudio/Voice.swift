import AVFoundation

/// Plays the character's line: the ElevenLabs recording when there is one,
/// otherwise the phone's own voice in the language being learned.
@MainActor
public final class Voice: NSObject {
    private var player: AVAudioPlayer?
    private let synthesizer = AVSpeechSynthesizer()
    private var finished: CheckedContinuation<Void, Never>?
    /// Bumped by each play or speak, so a late safety timer can't end a newer line
    private var playing = 0
    /// The phone's voice: how far through the text it has spoken, and the length
    private var spokenUpTo = 0
    private var spokenLength = 0

    /// How far through the current line the voice is (0...1), for the
    /// typewriter subtitles; 1 when nothing is playing
    public var progress: Double {
        if let player, player.duration > 0 { return min(1, player.currentTime / player.duration) }
        if synthesizer.isSpeaking, spokenLength > 0 { return min(1, Double(spokenUpTo) / Double(spokenLength)) }
        return 1
    }

    /// How loud the voice is right now (0...1), for the wave on the circle;
    /// nil for the phone's own voice, which can't be measured (the wave moves
    /// by itself then)
    public var level: Double? {
        guard let player, player.isPlaying else { return nil }
        player.updateMeters()
        return Double(max(0, min(1, (player.averagePower(forChannel: 0) + 50) / 45)))
    }

    public override init() {
        super.init()
        synthesizer.delegate = self
    }

    /// Plays MP3 data and returns when it has finished (or was stopped)
    public func play(_ data: Data) async throws {
        stop()
        let player = try AVAudioPlayer(data: data)
        player.delegate = self
        player.isMeteringEnabled = true
        self.player = player
        await withCheckedContinuation { continuation in
            finished = continuation
            if !player.play() { finish() }
            else { watch(Self.playDeadline(duration: player.duration)) }
        }
    }

    /// The phone's own voice: `language` is the pack's speech code (e.g. it-IT, es-MX)
    public func speak(_ text: String, language: String, rate: Float) async {
        stop()
        spokenUpTo = 0
        spokenLength = (text as NSString).length
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language)
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * rate
        await withCheckedContinuation { continuation in
            finished = continuation
            synthesizer.speak(utterance)
            watch(Self.speakDeadline(characters: spokenLength, rate: rate))
        }
    }

    /// Safety timers (2026-10-29): Josh saw onboarding freeze on its first
    /// screen, her photo and no way on. If the player is interrupted, or the
    /// phone's voice never says it finished (a missing voice, an audio
    /// interruption), the line would wait forever. So a line ends after its
    /// own length plus a margin, whatever the players report.
    nonisolated static func playDeadline(duration: TimeInterval) -> TimeInterval {
        max(duration, 0) + 3
    }

    /// The phone's voice speaks about 12 characters a second at rate 1; slower
    /// rates take longer. Generous on purpose: it only has to catch a hang
    nonisolated static func speakDeadline(characters: Int, rate: Float) -> TimeInterval {
        let perSecond = 12 * Double(max(rate, 0.3))
        return max(4, Double(characters) / perSecond * 1.5) + 3
    }

    private func watch(_ seconds: TimeInterval) {
        playing += 1
        let mine = playing
        Task { @MainActor [weak self] in
            try? await Task.sleep(for: .seconds(seconds))
            guard let self, self.playing == mine, self.finished != nil else { return }
            self.stop()
        }
    }

    /// Stops whatever is playing; a waiting `play` or `speak` returns
    public func stop() {
        playing += 1
        player?.stop()
        player = nil
        if synthesizer.isSpeaking { synthesizer.stopSpeaking(at: .immediate) }
        finish()
    }

    private func finish() {
        finished?.resume()
        finished = nil
    }
}

extension Voice: AVAudioPlayerDelegate {
    nonisolated public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        // Only the player still playing ends the wait: a late report from a
        // player already replaced cut the next word short (scan, 2026-10-29)
        let finished = ObjectIdentifier(player)
        Task { @MainActor in
            guard let current = self.player, ObjectIdentifier(current) == finished else { return }
            self.finish()
        }
    }
}

extension Voice: AVSpeechSynthesizerDelegate {
    nonisolated public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor in self.finish() }
    }

    nonisolated public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, willSpeakRangeOfSpeechString range: NSRange, utterance: AVSpeechUtterance) {
        Task { @MainActor in self.spokenUpTo = range.location + range.length }
    }
}
