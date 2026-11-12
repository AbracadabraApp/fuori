import Testing
@testable import FuoriAudio

/// The phone's voice, when the hosted one fails, matches the character's gender where the phone has such a voice
/// (Josh, 2026-11-12: Pietro at Termini spoke as Alice, a stock iPhone's only voice in his language). Sample codes of
/// languages the game doesn't teach, so test:language stays clean
struct PhoneVoiceTests {
    private let anna = Voice.PhoneVoice(id: "anna", language: "de-DE", gender: "f", quality: 1)
    private let markus = Voice.PhoneVoice(id: "markus", language: "de-DE", gender: "m", quality: 2)
    private let thomas = Voice.PhoneVoice(id: "thomas", language: "fr-FR", gender: "m", quality: 1)
    private let nicolas = Voice.PhoneVoice(id: "nicolas", language: "fr-CA", gender: "m", quality: 1)

    @Test func aManGetsAMansVoiceWhenOneIsInstalled() {
        #expect(Voice.phoneVoice(from: [anna, markus], language: "de-DE", gender: "m") == "markus")
        #expect(Voice.phoneVoice(from: [anna, markus], language: "de-DE", gender: "f") == "anna")
    }

    @Test func noMansVoiceInstalledLeavesThePhonesDefault() {
        #expect(Voice.phoneVoice(from: [anna], language: "de-DE", gender: "m") == nil)
        #expect(Voice.phoneVoice(from: [anna, markus], language: "de-DE", gender: nil) == nil)
    }

    @Test func theCountrysVoiceFirstThenTheLanguageAnywhere() {
        #expect(Voice.phoneVoice(from: [thomas, nicolas], language: "fr-CA", gender: "m") == "nicolas")
        #expect(Voice.phoneVoice(from: [thomas], language: "fr-CA", gender: "m") == "thomas")
        #expect(Voice.phoneVoice(from: [thomas, markus], language: "ja-JP", gender: "m") == nil)
    }
}
