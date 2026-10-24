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
}
