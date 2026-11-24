import Testing
import FuoriDesign
@testable import FuoriFeatures

/// The visit stamp's stage (docs/visited-badge.md): none before a visit,
/// visited after the first, regular from the third (Josh, 2026-10-29)
struct VisitStageTests {
    @Test func stageFromVisits() {
        #expect(VisitStamp.Stage(visits: 0) == nil)
        #expect(VisitStamp.Stage(visits: 1) == .visited)
        #expect(VisitStamp.Stage(visits: 2) == .visited)
        #expect(VisitStamp.Stage(visits: 3) == .regular)
        #expect(VisitStamp.Stage(visits: 12) == .regular)
    }

    /// B52 (Josh, 2026-11-23: "YA/Fuist/E on 3 lines"): the stamp's words go one to a line and
    /// may take no more lines than they have words, so a long word shrinks and is never broken
    @Test func stampWordsGoOneToALine() {
        #expect(VisitStamp.lines("ya fuiste") == "YA\nFUISTE")
        #expect(VisitStamp.lineCount("ya fuiste") == 2)
        #expect(VisitStamp.lines("già visto") == "GIÀ\nVISTO")
        #expect(VisitStamp.lineCount("de casa") == 2)
        #expect(VisitStamp.lines("visto") == "VISTO")
        #expect(VisitStamp.lineCount("") == 1)
    }
}
