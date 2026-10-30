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
    public var writeFailures: Int { pcmLock.withLock { failures } }
    private var failures = 0
    /// True between a successful `start` and the next `stop`
    public private(set) var isRecording = false
    /// What stopped the last recording, and when (system uptime): for the
    /// error report when a turn ends with no file (2026-10-22, the
    /// "0 buffers failed to write" errors on Josh's phone)
    public private(set) var lastStop: (reason: String, at: TimeInterval)?

    /// The turn so far as 16 kHz 16-bit mono, kept beside the file so a copy
    /// can be sent while the learner is still in their turn: transcribing
    /// starts during the silence that may end it (2026-10-23, speed)
    private static let pcmFormat = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: 16_000, channels: 1, interleaved: true)!
    private var converter: AVAudioConverter?
    private var pcm = Data()
    private let pcmLock = NSLock()

    public init() {}

    /// Seconds recorded so far in this turn
    public var recordedSeconds: Double {
        pcmLock.withLock { Double(pcm.count) / 2 / Self.pcmFormat.sampleRate }
    }

    /// The turn so far as a WAV file, for transcribing before the turn ends
    public func snapshotWAV() -> Data {
        let samples = pcmLock.withLock { pcm }
        return Self.wav(samples, sampleRate: Int(Self.pcmFormat.sampleRate))
    }

    /// A 16-bit mono PCM WAV file
    static func wav(_ samples: Data, sampleRate: Int) -> Data {
        var d = Data()
        func u32(_ v: Int) { var x = UInt32(v).littleEndian; d.append(Data(bytes: &x, count: 4)) }
        func u16(_ v: Int) { var x = UInt16(v).littleEndian; d.append(Data(bytes: &x, count: 2)) }
        d.append(Data("RIFF".utf8)); u32(36 + samples.count); d.append(Data("WAVE".utf8))
        d.append(Data("fmt ".utf8)); u32(16); u16(1); u16(1); u32(sampleRate); u32(sampleRate * 2); u16(2); u16(16)
        d.append(Data("data".utf8)); u32(samples.count); d.append(samples)
        return d
    }

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
        // This recording's own file and converter, captured by its tap: the
        // audio thread never reads them through self, so stop() and the next
        // start() can't swap them while a buffer is being written (whole-app
        // scan, 2026-10-29; Flashcards could start a second recording over
        // the first). The file closes when the tap's last reference goes
        let file = try AVAudioFile(forWriting: url, settings: settings, commonFormat: .pcmFormatFloat32, interleaved: false)
        let converter = AVAudioConverter(from: mono, to: Self.pcmFormat)
        self.file = file
        self.url = url
        self.converter = converter
        pcmLock.withLock { pcm = Data(); failures = 0 }

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
                do { try file.write(from: copy) } catch { self.pcmLock.withLock { self.failures += 1 } }
                self.keep(copy, with: converter)
            }
        }
        engine.prepare()
        try engine.start()
        isRecording = true
    }

    /// Adds a buffer to the 16 kHz copy (audio thread)
    private func keep(_ buffer: AVAudioPCMBuffer, with converter: AVAudioConverter?) {
        guard let converter else { return }
        let capacity = AVAudioFrameCount(Double(buffer.frameLength) * Self.pcmFormat.sampleRate / buffer.format.sampleRate) + 32
        guard let out = AVAudioPCMBuffer(pcmFormat: Self.pcmFormat, frameCapacity: capacity) else { return }
        // The converter calls back synchronously: one buffer in, then "no more for now"
        final class Given: @unchecked Sendable { var done = false }
        let given = Given()
        nonisolated(unsafe) let input = buffer
        var error: NSError?
        converter.convert(to: out, error: &error) { _, status in
            if given.done { status.pointee = .noDataNow; return nil }
            given.done = true
            status.pointee = .haveData
            return input
        }
        guard error == nil, out.frameLength > 0, let samples = out.int16ChannelData?[0] else { return }
        let bytes = Data(bytes: samples, count: Int(out.frameLength) * 2)
        pcmLock.withLock { pcm.append(bytes) }
    }

    /// Stops recording and returns the file (nil if nothing was recording).
    /// `reason` says who stopped it, kept in `lastStop` for error reports.
    @discardableResult
    public func stop(_ reason: String) -> URL? {
        if isRecording { lastStop = (reason, ProcessInfo.processInfo.systemUptime) }
        isRecording = false
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        file = nil // closes the file
        // Handed over once: the caller deletes it after reading
        defer { url = nil }
        return url
    }

    public enum RecorderError: Error { case noMicrophone }
}
