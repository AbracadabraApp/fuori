import Testing
@testable import FuoriFeatures

/// The card's hint and its English cue (docs/flashcards.md → The banner and help)
struct FlashcardHelpTests {
    @Test func hintKeepsTheArticleAndFirstLetters() {
        #expect(FlashcardsModel.hint(for: "il caffè") == "il ca___")
        #expect(FlashcardsModel.hint(for: "l'aula") == "l'au___")
        #expect(FlashcardsModel.hint(for: "el café de olla") == "el ca___")
        #expect(FlashcardsModel.hint(for: "mijo") == "mi___")
    }

    @MainActor @Test func englishSplitsAtItsBracket() {
        #expect(FlashcardRowSplit.split("coffee (an espresso)") == ("coffee", "(an espresso)"))
        #expect(FlashcardRowSplit.split("night") == ("night", nil))
    }

    @Test func stageThreeNeedsTheArticle() {
        #expect(FlashcardsModel.matches(heard: "Il caffè.", said: "il caffè", needArticle: true))
        #expect(!FlashcardsModel.matches(heard: "caffè", said: "il caffè", needArticle: true))
        #expect(FlashcardsModel.matches(heard: "caffè", said: "il caffè", needArticle: false))
    }
}
