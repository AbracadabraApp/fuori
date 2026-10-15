import Foundation

/// Hears whether the learner is speaking, from loudness alone, so it works in
/// any language with no word lists (docs/12-native-app.md → Audio pipeline).
///
/// Fed one level (dBFS) per audio buffer. The first ~300 ms set the room's
/// noise floor; a buffer counts as voice when it's clearly above that floor.
/// The conversation decides what the silences mean (first-word wait, end of
/// turn); the gate only measures.
public struct VoiceGate: Sendable {
    /// How far above the noise floor counts as voice
    public var margin: Float = 12
    /// Never treat anything quieter than this as voice, however quiet the room
    public var minimumVoice: Float = -50
    /// Time spent measuring the room before listening
    public var calibration: TimeInterval = 0.3

    public private(set) var noiseFloor: Float?
    /// Total time heard as voice in this turn
    public private(set) var voiced: TimeInterval = 0
    /// When voice was last heard; nil until the learner first speaks
    public private(set) var lastVoiceAt: TimeInterval?

    private var start: TimeInterval?
    private var calibrationLevels: [Float] = []
    private var lastTime: TimeInterval?

    public init() {}

    public var hasSpoken: Bool { lastVoiceAt != nil }

    /// Silence since the learner last spoke (0 before they've said anything)
    public func silence(at time: TimeInterval) -> TimeInterval {
        guard let lastVoiceAt else { return 0 }
        return max(0, time - lastVoiceAt)
    }

    /// Process one buffer's level at `time` (seconds, any monotonic clock).
    /// Returns true when the buffer is voice.
    @discardableResult
    public mutating func process(level: Float, at time: TimeInterval) -> Bool {
        defer { lastTime = time }
        if start == nil { start = time }
        if noiseFloor == nil {
            calibrationLevels.append(level)
            if time - start! >= calibration {
                // A quiet but not silent estimate: the median of what was heard
                let sorted = calibrationLevels.sorted()
                noiseFloor = sorted[sorted.count / 2]
            }
            return false
        }
        let threshold = max(noiseFloor! + margin, minimumVoice)
        guard level >= threshold else { return false }
        if let lastTime { voiced += min(time - lastTime, 0.5) }
        lastVoiceAt = time
        return true
    }

    /// Root-mean-square level of samples in dBFS (-160 for silence)
    public static func level(of samples: UnsafeBufferPointer<Float>) -> Float {
        guard !samples.isEmpty else { return -160 }
        var sum: Float = 0
        for s in samples { sum += s * s }
        let rms = (sum / Float(samples.count)).squareRoot()
        return rms > 0 ? max(-160, 20 * log10(rms)) : -160
    }
}
