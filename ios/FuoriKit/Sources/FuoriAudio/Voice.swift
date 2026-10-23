import AVFoundation

/// Plays the character's line: the ElevenLabs recording when there is one,
/// otherwise the phone's own voice in the language being learned.
@MainActor
public final class Voice: NSObject {
    private var player: AVAudioPlayer?
    private let synthesizer = AVSpeechSynthesizer()
    private var finished: CheckedContinuation<Void, Never>?
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
        }
    }

    /// Stops whatever is playing; a waiting `play` or `speak` returns
    public func stop() {
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
        Task { @MainActor in self.finish() }
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
