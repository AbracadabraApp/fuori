import Testing
@testable import FuoriAudio

/// The phone's voice, when the hosted one fails, matches the character's gender where the phone has such a voice
/// (Josh, 2026-11-12: Pietro at Termini spoke as Alice, the only Italian voice on a stock iPhone)
struct PhoneVoiceTests {
    private let alice = Voice.PhoneVoice(id: "alice", language: "it-IT", gender: "f", quality: 1)
    private let luca = Voice.PhoneVoice(id: "luca", language: "it-IT", gender: "m", quality: 2)
    private let jorge = Voice.PhoneVoice(id: "jorge", language: "es-ES", gender: "m", quality: 1)
    private let juan = Voice.PhoneVoice(id: "juan", language: "es-MX", gender: "m", quality: 1)

    @Test func aManGetsAMansVoiceWhenOneIsInstalled() {
        #expect(Voice.phoneVoice(from: [alice, luca], language: "it-IT", gender: "m") == "luca")
        #expect(Voice.phoneVoice(from: [alice, luca], language: "it-IT", gender: "f") == "alice")
    }

    @Test func noMansVoiceInstalledLeavesThePhonesDefault() {
        #expect(Voice.phoneVoice(from: [alice], language: "it-IT", gender: "m") == nil)
        #expect(Voice.phoneVoice(from: [alice, luca], language: "it-IT", gender: nil) == nil)
    }

    @Test func theCountrysVoiceFirstThenTheLanguageAnywhere() {
        #expect(Voice.phoneVoice(from: [jorge, juan], language: "es-MX", gender: "m") == "juan")
        #expect(Voice.phoneVoice(from: [jorge], language: "es-MX", gender: "m") == "jorge")
        #expect(Voice.phoneVoice(from: [jorge, luca], language: "fr-FR", gender: "m") == nil)
    }
}
