import Foundation
import Testing
@testable import FuoriFeatures

/// The feed's order (docs/flashcards.md → Plan; Josh, 2026-10-29): new words
/// keep coming, words come back with decay, a skipped card waits its turn
struct FlashcardScheduleTests {
    let pool = (1...60).map { "w\($0)" }
    let now = Date(timeIntervalSince1970: 1_800_000_000)

    /// A fixed sequence of "random" numbers, so a run is repeatable
    final class Dice {
        var seed: UInt64
        init(_ seed: UInt64) { self.seed = seed }
        func roll() -> Double {
            seed = seed &* 6364136223846793005 &+ 1442695040888963407
            return Double(seed >> 11) / Double(1 << 53)
        }
    }

    /// Fills a feed of `count` cards. `answer` says, per card, whether it's
    /// tried and whether it needed help (nil: scrolled past untried)
    func run(_ s: inout FlashcardSchedule, _ count: Int, dice: Dice = Dice(7), answer: (Int, String) -> Bool? = { _, _ in false }) -> [String] {
        var shown: [String] = []
        for slot in 0..<count {
            let id = s.next(from: pool, slot: slot, now: now, random: dice.roll)!
            shown.append(id)
            if let helped = answer(slot, id) { s.answered(id, helped: helped, slot: slot, now: now, random: dice.roll) }
        }
        return shown
    }

    @Test func moreThanFiveWordsInPlay() {
        // Josh, 2026-10-29: "5 is not a feed"
        var s = FlashcardSchedule()
        let shown = run(&s, 60)
        // No word comes back sooner than 8 cards after its first pass (12 × 0.7)
        #expect(Set(shown.prefix(8)).count == 8)
        #expect(Set(shown).count >= 15)
    }

    @Test func noWordWithinSixCards() {
        var s = FlashcardSchedule()
        let shown = run(&s, 120, answer: { slot, _ in slot % 4 == 0 })
        for (i, id) in shown.enumerated() {
            #expect(!shown[max(0, i - FlashcardSchedule.apart + 1)..<i].contains(id), "\(id) at \(i)")
        }
    }

    @Test func skippingAllSixtyBringsCardOneBack() {
        // Josh, 2026-10-29: "go through 60 cards (trying none) the 61 card is the 1st"
        var s = FlashcardSchedule()
        let shown = run(&s, 61, answer: { _, _ in nil })
        #expect(Array(shown.prefix(60)) == pool)
        #expect(shown[60] == "w1")
    }

    @Test func aSkippedNewWordDoesntComeBackEarly() {
        var s = FlashcardSchedule()
        // w1 skipped, everything else tried
        let shown = run(&s, 40, answer: { slot, _ in slot == 0 ? nil : false })
        #expect(!shown.dropFirst().contains("w1"))
    }

    @Test func gapsGrowAndVary() {
        // Josh: 3 cards "too fast"; "they shouldn't all go equal amounts back"
        var gaps: Set<Int> = []
        for seed in 1...20 {
            var s = FlashcardSchedule()
            let shown = run(&s, 80, dice: Dice(UInt64(seed)))
            if let first = shown.firstIndex(of: "w1"), let again = shown[(first + 1)...].firstIndex(of: "w1") {
                gaps.insert(again - first)
                #expect(again - first >= 6)
            }
        }
        #expect(gaps.count > 3)
    }

    @Test func helpBringsAWordBackSoonerAtTheSameStage() {
        var s = FlashcardSchedule()
        s.answered("w1", helped: false, slot: 0, now: now) { 0.5 }
        #expect(s.stage("w1") == .recall)
        let afterPass = s.gap["w1"]!
        s.answered("w1", helped: true, slot: 12, now: now) { 0.5 }
        #expect(s.stage("w1") == .recall)
        #expect(s.gap["w1"]! < afterPass)
        #expect(s.words["w1"]!.ease < 1)
    }

    @Test func passesStretchTheGapsThenDays() {
        var s = FlashcardSchedule()
        var gaps: [Int] = []
        for slot in [0, 20, 60] {
            s.answered("w1", helped: false, slot: slot, now: now) { 0.5 }
            gaps.append(s.gap["w1"]!)
        }
        #expect(gaps[0] < gaps[1] && gaps[1] < gaps[2])
        #expect(s.stage("w1") == .say)
        s.answered("w1", helped: false, slot: 150, now: now) { 0.5 }
        let due = s.words["w1"]!.due!
        #expect(due > now)
        // Not back in this visit until its day; then it is
        #expect(s.pull("w1", slot: 400, now: now) == 0)
        #expect(s.pull("w1", slot: 400, now: due) > 0)
    }

    @Test func nothingLeavesTheFeed() {
        // No "your words": a word on days still comes back on its day
        var s = FlashcardSchedule(words: ["w1": .init(stage: .say, step: 5, due: now)])
        let shown = run(&s, 20, answer: { _, _ in nil })
        #expect(shown.contains("w1"))
    }
}
