import Testing
import FuoriCore
@testable import FuoriFeatures

/// The tour's cards read aloud (Josh, 2026-10-23): her line, the note, her
/// question, extras; not the translations; no italics markers; every part
/// ends a sentence
@Suite struct OrientationSpokenTests {
    @Test func readsTheWholeCard() {
        let card = Onboarding.Card(line: "Ciao! Benvenuti.", en: "Hi! Welcome.", note: "Even a welcome changes: *benvenuto* for a man")
        let question = Onboarding.Card(line: "Come ti chiami?", en: "What's your name? Tap the mic", note: nil)
        let spoken = OnboardingModel.spoken(card, question: question, extra: ["Like this"])
        #expect(spoken == "Ciao! Benvenuti. Even a welcome changes: benvenuto for a man. Come ti chiami? Like this.")
    }

    @Test func noQuestionNoNote() {
        let card = Onboarding.Card(line: "Perfetto!", en: "Perfect!", note: nil)
        #expect(OnboardingModel.spoken(card, question: nil) == "Perfetto!")
    }
}
