import Testing
@testable import FuoriAudio

/// The gate hears voice above the room's noise, not the noise itself, and
/// measures silence from the last voice: the timings the hands-free turn
/// depends on (4 s to end a turn, 10 s for the first word).
@Suite struct VoiceGateTests {
    /// Feed `seconds` of one level in 20 ms buffers starting at `from`
    func feed(_ gate: inout VoiceGate, level: Float, from: Double, seconds: Double) -> Double {
        var t = from
        while t < from + seconds { gate.process(level: level, at: t); t += 0.02 }
        return t
    }

    @Test func quietRoomIsNotVoice() {
        var gate = VoiceGate()
        let t = feed(&gate, level: -60, from: 0, seconds: 5)
        #expect(!gate.hasSpoken)
        #expect(gate.silence(at: t) == 0)
    }

    @Test func noisyCafeIsNotVoiceButSpeechAboveItIs() {
        var gate = VoiceGate()
        var t = feed(&gate, level: -35, from: 0, seconds: 2) // café hum
        #expect(!gate.hasSpoken)
        t = feed(&gate, level: -18, from: t, seconds: 1)    // the learner, louder than the hum
        #expect(gate.hasSpoken)
        #expect(gate.voiced > 0.9)
    }

    @Test func silenceCountsFromTheLastVoice() {
        var gate = VoiceGate()
        var t = feed(&gate, level: -60, from: 0, seconds: 0.5)
        t = feed(&gate, level: -20, from: t, seconds: 1)
        let spokeUntil = t
        t = feed(&gate, level: -60, from: t, seconds: 4)
        #expect(abs(gate.silence(at: t) - (t - spokeUntil)) < 0.05)
        #expect(gate.silence(at: t) >= 3.9)
    }

    @Test func aBriefClickIsTooShortToCount() {
        var gate = VoiceGate()
        var t = feed(&gate, level: -60, from: 0, seconds: 0.5)
        t = feed(&gate, level: -10, from: t, seconds: 0.04)
        #expect(gate.voiced < 0.25) // under the 250 ms the conversation needs before uploading
    }
}
