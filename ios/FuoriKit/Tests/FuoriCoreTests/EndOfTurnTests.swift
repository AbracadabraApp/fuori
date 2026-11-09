import Testing
@testable import FuoriCore

/// The end-of-turn wait from what's been heard (EndOfTurn), on the shapes
/// Whisper gave in the 2026-10-23 test
@Suite struct EndOfTurnTests {
    @Test func finishedSentencesEndSooner() {
        #expect(EndOfTurn.silence(after: "Vorrei un caffè, per favore.") == EndOfTurn.finished)
        #expect(EndOfTurn.silence(after: "«Quanto costa?»") == EndOfTurn.finished)
        #expect(EndOfTurn.silence(after: "¡Sí, gracias!") == EndOfTurn.finished)
        #expect(EndOfTurn.silence(after: "«Vorrei un caffè, per favore».") == EndOfTurn.finished)
    }

    @Test func trailingSentencesGetLonger() {
        #expect(EndOfTurn.silence(after: "Quanto costa il...") == EndOfTurn.trailing)
        #expect(EndOfTurn.silence(after: "Sí, pero quiero…") == EndOfTurn.trailing)
        #expect(EndOfTurn.silence(after: "abito qui vicino e") == EndOfTurn.trailing)
        #expect(EndOfTurn.silence(after: "Vorrei un caffè,") == EndOfTurn.trailing)
    }

    @Test func nothingHeardIsUsual() {
        #expect(EndOfTurn.silence(after: "  ") == EndOfTurn.usual)
    }

    /// Intermediate and Advanced wait less, in every case; Beginners keep 2.5 s (N6 item 5)
    @Test func shorterForSpeakers() {
        let speaking = EndOfTurn.waits(beginner: false)
        #expect(EndOfTurn.waits(beginner: true).usual == 2.5)
        #expect(EndOfTurn.silence(after: "", waits: speaking) < EndOfTurn.silence(after: ""))
        #expect(EndOfTurn.silence(after: "Vorrei un caffè, per favore.", waits: speaking) < EndOfTurn.finished)
        #expect(EndOfTurn.silence(after: "Vorrei un…", waits: speaking) < EndOfTurn.trailing)
        #expect(EndOfTurn.silence(after: "Vorrei un…", waits: speaking) > EndOfTurn.silence(after: "Vorrei un caffè.", waits: speaking))
    }

    /// A draft of her reply (docs/12-native-app.md item 5) only while the turn still has time left
    @Test func draftsOnlyWhileTheTurnWaits() {
        // Not yet 1.5 s of silence
        #expect(!EndOfTurn.shouldDraft(silence: 1.2, endsAt: 3.5))
        // Trailing off: 3.5 s to wait, so her reply can be ready when it ends
        #expect(EndOfTurn.shouldDraft(silence: 1.5, endsAt: 3.5))
        #expect(EndOfTurn.shouldDraft(silence: 2.0, endsAt: 2.5))
        // The turn is ending now (a finished sentence's wait has passed): nothing to gain
        #expect(!EndOfTurn.shouldDraft(silence: 1.6, endsAt: 1.2))
        #expect(!EndOfTurn.shouldDraft(silence: 2.5, endsAt: 2.5))
        // The draft wait is after the early transcript is asked for
        #expect(EndOfTurn.draftAfter > 1.0)
    }
}
