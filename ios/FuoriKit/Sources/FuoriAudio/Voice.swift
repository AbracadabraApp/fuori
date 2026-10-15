import AVFoundation

/// Plays the character's line: the ElevenLabs recording when there is one,
/// otherwise the phone's own voice in the language being learned.
@MainActor
public final class Voice: NSObject {
    private var player: AVAudioPlayer?
    private let synthesizer = AVSpeechSynthesizer()
    private var finished: CheckedContinuation<Void, Never>?

    public override init() {
        super.init()
        synthesizer.delegate = self
    }

    /// Plays MP3 data and returns when it has finished (or was stopped)
    public func play(_ data: Data) async throws {
        stop()
        let player = try AVAudioPlayer(data: data)
        player.delegate = self
        self.player = player
        await withCheckedContinuation { continuation in
            finished = continuation
            if !player.play() { finish() }
        }
    }

    /// The phone's own voice: `language` is the pack's speech code (e.g. it-IT, es-MX)
    public func speak(_ text: String, language: String, rate: Float) async {
        stop()
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
}
