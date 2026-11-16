import Testing
@testable import FuoriFeatures

/// B43 (Josh, 2026-11-16: the level up page "deployed after a conversation had
/// started and sat/spoke behind it"; "it wasn't interstitial"). The offer is
/// asked for once the last conversation is saved, and can arrive when the
/// learner is already in the next one. It waits until no conversation is on
/// screen.
@Suite struct LevelUpHoldTests {
    @Test func anOfferWaitsWhileAConversationIsOpen() {
        #expect(AppModel.showable("offer", conversationOpen: true) == nil)
    }

    @Test func anOfferShowsOnceTheConversationIsLeft() {
        #expect(AppModel.showable("offer", conversationOpen: false) == "offer")
    }

    @Test func noOfferShowsNothingEitherWay() {
        #expect(AppModel.showable(String?.none, conversationOpen: false) == nil)
        #expect(AppModel.showable(String?.none, conversationOpen: true) == nil)
    }
}
