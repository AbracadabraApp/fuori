import FuoriDesign

extension VisitStamp.Stage {
    /// A place's stage from its visit count (docs/visited-badge.md): visited
    /// after the first conversation there, regular from the third (Josh,
    /// 2026-10-29: "I think 3"); nil before any visit
    init?(visits: Int) {
        if visits >= 3 { self = .regular } else if visits >= 1 { self = .visited } else { return nil }
    }
}
