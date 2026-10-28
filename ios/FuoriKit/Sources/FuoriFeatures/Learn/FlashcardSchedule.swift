import Foundation

/// What comes next in the flashcard feed (docs/flashcards.md → Order; Josh,
/// 2026-10-28: "endless with frequency", the way Anki does it). Spacing, not
/// dice: a word you're working on comes back a set number of cards later, a
/// step further along each time; a word that's yours comes back as a check
/// after 1 day, then 3, 7, 16, 40, 90. A few new words at a time, so words in
/// progress get finished before new ones crowd in.
///
/// Positions in the feed are "slots" (the feed's length when a card was
/// added). Gaps within a session live only in memory; stages and the days of
/// words that are yours are saved.
struct FlashcardSchedule: Equatable {
    enum Stage: Int, Codable, Sendable { case meet = 1, recall = 2, say = 3 }

    struct Own: Codable, Equatable, Sendable {
        /// When it next comes back as a check
        var due: Date
        /// Index into `intervals`: how many checks it has passed
        var step: Int
    }

    /// Days until a word that's yours comes back, one step per pass
    static let intervals = [1, 3, 7, 16, 40, 90]
    /// Cards until a word comes back: after passing stage 1, after passing
    /// stage 2, after a miss, and after scrolling past it without answering
    static let afterMeet = 3, afterRecall = 6, afterMiss = 2, afterSkip = 5
    /// Words in progress at once before a new one comes in
    static let working = 5
    /// The same word never closer than this many cards apart
    static let apart = 4

    /// Words in progress (met, not yet yours)
    private(set) var stages: [String: Stage] = [:]
    private(set) var own: [String: Own] = [:]
    /// In this session: the slot from which a word in progress is due again
    private(set) var dueAt: [String: Int] = [:]

    init(stages: [String: Stage] = [:], own: [String: Own] = [:]) {
        self.stages = stages
        self.own = own
    }

    func isOwn(_ id: String) -> Bool { own[id] != nil }

    /// A word that's yours comes back at "say it"
    func stage(_ id: String) -> Stage { isOwn(id) ? .say : (stages[id] ?? .meet) }

    /// The next card for slot `slot`, from `pool` (in the deck's order), never
    /// one of `recent` (the cards just before it)
    func next(from pool: [String], recent: [String], slot: Int, now: Date) -> String? {
        let blocked = Set(recent)
        let open = pool.filter { !blocked.contains($0) }
        let working = open.filter { stages[$0] != nil }
        let fresh = open.filter { stages[$0] == nil && own[$0] == nil }
        let mine = open.filter { own[$0] != nil }
        func due(_ id: String) -> Int { dueAt[id] ?? 0 }

        // 1 · a word in progress whose gap is up (from an earlier session: at once)
        if let id = working.filter({ due($0) <= slot }).min(by: { due($0) < due($1) }) { return id }
        // 2 · a word that's yours, due for its check
        if let id = mine.filter({ own[$0]!.due <= now }).min(by: { own[$0]!.due < own[$1]!.due }) { return id }
        // 3 · a new word, if there's room
        if stages.count < Self.working, let id = fresh.first { return id }
        // 4 · otherwise the word in progress due soonest
        if let id = working.min(by: { due($0) < due($1) }) { return id }
        // 5 · a new word anyway, then yours early as extra practice
        if let id = fresh.first { return id }
        if let id = mine.min(by: { own[$0]!.due < own[$1]!.due }) { return id }
        // A deck smaller than the spacing: anything but the card just before
        return pool.first { $0 != recent.last } ?? pool.first
    }

    /// Added to the feed at `slot`: met, and back after a while if scrolled past
    mutating func shown(_ id: String, slot: Int) {
        if own[id] == nil, stages[id] == nil { stages[id] = .meet }
        if own[id] == nil { dueAt[id] = slot + Self.afterSkip }
    }

    /// Said right. `end` is the feed's length now
    mutating func passed(_ id: String, end: Int, now: Date) {
        if let mine = own[id] {
            let step = min(mine.step + 1, Self.intervals.count - 1)
            own[id] = Own(due: Self.day(Self.intervals[step], after: now), step: step)
            return
        }
        switch stage(id) {
        case .meet:
            stages[id] = .recall
            dueAt[id] = end + Self.afterMeet
        case .recall:
            stages[id] = .say
            dueAt[id] = end + Self.afterRecall
        case .say:
            stages[id] = nil
            dueAt[id] = nil
            own[id] = Own(due: Self.day(Self.intervals[0], after: now), step: 0)
        }
    }

    /// Missed (or the answer asked for): same stage, back soon. A word that
    /// was yours goes back to "say it"
    mutating func missed(_ id: String, end: Int) {
        if own[id] != nil {
            own[id] = nil
            stages[id] = .say
        }
        dueAt[id] = end + Self.afterMiss
    }

    static func day(_ days: Int, after now: Date) -> Date { now.addingTimeInterval(Double(days) * 86_400) }
}
