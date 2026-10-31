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
}
