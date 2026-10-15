import AVFoundation

/// Records one learner turn to an m4a file while reporting the level of every
/// buffer, so the voice gate and the file come from the same audio.
/// The mic is open only between `start` and `stop` (the learner's turn).
public final class Recorder: @unchecked Sendable {
    private let engine = AVAudioEngine()
    private var file: AVAudioFile?
    public private(set) var url: URL?
    /// Buffers that couldn't be written to the file in this turn; the
    /// conversation reports a non-zero count instead of sending a broken file
    public private(set) var writeFailures = 0

    public init() {}

    /// Starts recording. `onLevel` is called on the audio thread with each
    /// buffer's level (dBFS) and the time in seconds.
    public func start(onLevel: @escaping @Sendable (Float, TimeInterval) -> Void) throws {
        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        guard format.sampleRate > 0, format.channelCount > 0 else { throw RecorderError.noMicrophone }

        let url = FileManager.default.temporaryDirectory.appending(path: "turn-\(UUID().uuidString).m4a")
        let settings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            // The mic's own rate: the file's processing format must match the buffers
            AVSampleRateKey: format.sampleRate,
            AVNumberOfChannelsKey: 1,
            AVEncoderBitRateKey: 64_000,
        ]
        let mono = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: format.sampleRate, channels: 1, interleaved: false)!
        file = try AVAudioFile(forWriting: url, settings: settings, commonFormat: .pcmFormatFloat32, interleaved: false)
        self.url = url
        writeFailures = 0

        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, time in
            guard let self, let channel = buffer.floatChannelData?[0] else { return }
            let samples = UnsafeBufferPointer(start: channel, count: Int(buffer.frameLength))
            let seconds = AVAudioTime.seconds(forHostTime: time.hostTime)
            onLevel(VoiceGate.level(of: samples), seconds)
            // First channel only: the turn is mono speech
            if let copy = AVAudioPCMBuffer(pcmFormat: mono, frameCapacity: buffer.frameLength) {
                copy.frameLength = buffer.frameLength
                copy.floatChannelData![0].update(from: channel, count: Int(buffer.frameLength))
                do { try self.file?.write(from: copy) } catch { self.writeFailures += 1 }
            }
        }
        engine.prepare()
        try engine.start()
    }

    /// Stops recording and returns the file (nil if nothing was recording)
    @discardableResult
    public func stop() -> URL? {
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        file = nil // closes the file
        return url
    }

    public enum RecorderError: Error { case noMicrophone }
}
