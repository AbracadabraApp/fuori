import Foundation
import Testing
@testable import FuoriAudio

/// Every recording is played at about the same loudness (Josh, 2026-11-04:
/// "Valeria is very loud"). Fixtures are two real ElevenLabs clips measured
/// with ffmpeg: Vale at -12.3 LUFS, Max at -38.3.
@Suite struct VoiceLoudnessTests {
    private func clip(_ name: String) throws -> Data {
        try Data(contentsOf: try #require(Bundle.module.url(forResource: name, withExtension: "mp3", subdirectory: "Fixtures")))
    }

    @Test func measuresAClipLikeFfmpeg() throws {
        let loud = try #require(Voice.loudness(of: try clip("loud")))
        let quiet = try #require(Voice.loudness(of: try clip("quiet")))
        #expect(abs(loud - -12.3) < 1.5)
        #expect(abs(quiet - -38.3) < 1.5)
    }

    @Test func turnsLoudClipsDownNeverUp() throws {
        let loud = try #require(Voice.loudness(of: try clip("loud")))
        // About 8 dB down for Vale
        #expect(Voice.volume(loudness: loud) < 0.5)
        #expect(Voice.volume(loudness: -38.3) == 1)
        #expect(Voice.volume(loudness: -20) == 1)
        #expect(abs(Voice.volume(loudness: -14) - 0.501) < 0.01)
    }

    @Test func notAudioIsNoMeasure() {
        #expect(Voice.loudness(of: Data("not audio".utf8)) == nil)
    }
}
