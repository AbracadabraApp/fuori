import Testing
@testable import FuoriCore

@Suite struct HeardTests {
    @Test func punctuationIsNothingSaid() {
        for noise in ["...", "…", "?", " . ", "", "!!"] { #expect(!Heard.hasWords(noise), "\(noise)") }
    }

    @Test func wordsInAnyLanguageCount() {
        for said in ["Ciao", "sì", "¿Qué?", "ok", "Grazie mille, quanto costano?"] { #expect(Heard.hasWords(said), "\(said)") }
    }
}
