import Testing
@testable import FuoriFeatures

/// The mic check on a flashcard (docs/flashcards.md): lenient on accents,
/// case and close spellings; stage 3 wants the article, stage 1 doesn't
@Suite struct FlashcardMatchTests {
    @Test func stageOneAcceptsTheWordAlone() {
        #expect(FlashcardsModel.matches(heard: "Banco.", said: "il banco", needArticle: false))
        #expect(FlashcardsModel.matches(heard: "albicoca", said: "l'albicocca", needArticle: false))
        #expect(FlashcardsModel.matches(heard: "caffe", said: "il caffè", needArticle: false))
    }

    @Test func stageThreeWantsTheArticle() {
        #expect(FlashcardsModel.matches(heard: "Il banco!", said: "il banco", needArticle: true))
        #expect(!FlashcardsModel.matches(heard: "banco", said: "il banco", needArticle: true))
    }

    @Test func wrongWordsFail() {
        #expect(!FlashcardsModel.matches(heard: "il treno", said: "il banco", needArticle: true))
        #expect(!FlashcardsModel.matches(heard: "", said: "il banco", needArticle: false))
        #expect(!FlashcardsModel.matches(heard: "pomodoro", said: "il banco", needArticle: false))
    }
}
