import Foundation

/// What comes next in the flashcard feed (docs/flashcards.md → Plan; Josh,
/// 2026-10-29). Success is how long a visit lasts, then coming back, so the
/// feed keeps changing: new words keep coming in, and words come back with
/// decay, not on fixed slots ("some sort of decay on repetition / new cards -
/// not a rigid repetition"). "5 is not a feed": there's no limit on words in
/// play.
///
/// - Each card is a weighted random pick. A word's pull to come back is zero
///   for `apart` cards after it's shown, then grows, passing 1 at its gap and
///   rising fast after it.
/// - Gaps: about 12 cards after stage 1, 25 after stage 2, 50 after stage 3,
///   then days (1, 3, 7, 16, 40, 90). Not equal for every word ("they
///   shouldn't all go equal amounts back"): each pass without help stretches
///   that word's gaps, each help shortens them, and every gap has a random
///   spread. Help brings a word back after about 8, at the same stage.
/// - New words weigh heavily at first and ease off as more words are in play,
///   never to zero.
/// - A card scrolled past untried isn't counted: the word waits its turn in
///   the deck. Scroll through all 60 trying none and card 61 is card 1 again
///   ("go through 60 cards (trying none) the 61 card is the 1st").
/// - No "your words" (Josh: "i don't love the your words concept"): nothing
///   leaves the feed; a word you know well just comes back rarely.
///
/// Positions in the feed are "slots" (a card's index). Where a word was last
/// shown lives only in memory; each word's stage, step, ease and day are saved.
struct FlashcardSchedule: Equatable {
    enum Stage: Int, Codable, Sendable { case meet = 1, recall = 2, say = 3 }

    struct Word: Codable, Equatable, Sendable {
        var stage: Stage = .meet
        /// Passes so far: 1–3 come back within the visit, 4 on are days
        var step = 0
        /// How easily it goes: stretches or shortens its gaps
        var ease = 1.0
        /// From step 4 on: the day it comes back
        var due: Date?
    }

    /// Cards until a word comes back after passing stage 1, 2 and 3
    static let gaps = [12, 25, 50]
    /// Then days, one step further per pass
    static let days = [1, 3, 7, 16, 40, 90]
    /// Cards until a word comes back after help
    static let afterHelp = 8
    /// The same word never closer than this many cards apart
    static let apart = 6
    static let easeRange = 0.6...1.6

    private(set) var words: [String: Word] = [:]
    /// In this visit: the slot a word was last shown at, and its gap in cards
    private(set) var last: [String: Int] = [:]
    private(set) var gap: [String: Int] = [:]
    /// The next untried word is looked for from here, in the deck's order,
    /// round and round
    private(set) var cursor = 0

    init(words: [String: Word] = [:]) {
        self.words = words
    }

    func stage(_ id: String) -> Stage { words[id]?.stage ?? .meet }

    /// The next card for slot `slot` from `pool` (in the deck's order).
    /// `random` gives a number in 0..<1 (seeded in tests)
    mutating func next(from pool: [String], slot: Int, now: Date, random: () -> Double) -> String? {
        guard !pool.isEmpty else { return nil }
        let near = Set(last.filter { slot - $0.value < Self.apart }.keys)

        // The pull of each word you've tried
        var pulls: [(String, Double)] = []
        for id in pool where words[id] != nil && !near.contains(id) {
            pulls.append((id, pull(id, slot: slot, now: now)))
        }
        // The next untried word, round the deck from the cursor
        let start = cursor, tried = words
        let fresh = (0..<pool.count).lazy.map { pool[(start + $0) % pool.count] }
            .first { tried[$0] == nil && !near.contains($0) }
        let inPlay = words.values.filter { $0.step < Self.gaps.count }.count
        let freshWeight = fresh == nil ? 0 : max(0.35, 3 / (1 + Double(inPlay) / 4))

        let total = pulls.reduce(0) { $0 + $1.1 } + freshWeight
        var pick: String?
        if total > 0 {
            var r = random() * total
            for (id, p) in pulls where p > 0 {
                r -= p
                if r < 0 { pick = id; break }
            }
            if pick == nil, let fresh { pick = fresh }
        }
        // Nothing pulls and nothing's new (a small deck): whatever was shown longest ago
        if pick == nil {
            pick = pool.filter { !near.contains($0) }.min { (last[$0] ?? -1) < (last[$1] ?? -1) }
                ?? pool.min { (last[$0] ?? -1) < (last[$1] ?? -1) }
        }
        guard let id = pick else { return nil }
        if id == fresh, let at = pool.firstIndex(of: id) { cursor = (at + 1) % pool.count }
        last[id] = slot
        return id
    }

    /// How strongly a word wants to come back now. Zero within `apart` cards;
    /// 1 at its gap; growing fast after it. Words from an earlier visit are
    /// due at once if their step is still within a visit, and on their day after
    func pull(_ id: String, slot: Int, now: Date) -> Double {
        guard let word = words[id] else { return 0 }
        if let due = word.due {
            guard due <= now else { return 0 }
            // Days overdue make it more urgent
            return 1 + now.timeIntervalSince(due) / 86_400
        }
        guard let at = last[id], let gap = gap[id] else { return 1 }
        let since = slot - at
        guard since >= Self.apart else { return 0 }
        return pow(Double(since) / Double(max(gap, 1)), 4)
    }

    /// The card at `slot` was answered: said with no help, or after help.
    /// `random` gives the spread (0..<1)
    mutating func answered(_ id: String, helped: Bool, slot: Int, now: Date, random: () -> Double) {
        var word = words[id] ?? Word()
        let spread = 0.7 + random() * 0.8
        last[id] = slot
        if helped {
            // Same stage, back soon; a word that was on days comes back into the visit
            word.ease = max(Self.easeRange.lowerBound, word.ease - 0.25)
            word.due = nil
            word.step = min(word.step, Self.gaps.count)
            gap[id] = max(Self.apart, Int((Double(Self.afterHelp) * spread).rounded()))
        } else {
            if word.step > 0 { word.ease = min(Self.easeRange.upperBound, word.ease + 0.15) }
            if word.step < Self.gaps.count {
                gap[id] = max(Self.apart, Int((Double(Self.gaps[word.step]) * word.ease * spread).rounded()))
                word.due = nil
            } else {
                let days = Self.days[min(word.step - Self.gaps.count, Self.days.count - 1)]
                word.due = now.addingTimeInterval(max(1, Double(days) * word.ease * spread) * 86_400)
                gap[id] = nil
            }
            word.step += 1
            word.stage = Stage(rawValue: min(word.stage.rawValue + 1, Stage.say.rawValue)) ?? .say
        }
        words[id] = word
    }
}
