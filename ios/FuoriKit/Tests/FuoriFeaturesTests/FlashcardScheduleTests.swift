import Foundation
import Testing
@testable import FuoriFeatures

/// The feed's order (docs/flashcards.md → Order): spacing, not dice
struct FlashcardScheduleTests {
    let pool = (1...20).map { "w\($0)" }
    let now = Date(timeIntervalSince1970: 1_800_000_000)

    /// Fills a feed of `count` cards, answering nothing
    func feed(_ s: inout FlashcardSchedule, _ count: Int) -> [String] {
        var shown: [String] = []
        for slot in 0..<count {
            let id = s.next(from: pool, recent: Array(shown.suffix(FlashcardSchedule.apart)), slot: slot, now: now)!
            s.shown(id, slot: slot)
            shown.append(id)
        }
        return shown
    }

    @Test func fiveNewWordsThenTheyComeBack() {
        var s = FlashcardSchedule()
        let shown = feed(&s, 10)
        // Five new words, then words already met come back (scrolled past),
        // never closer than `apart`
        #expect(Set(shown.prefix(5)).count == 5)
        #expect(Set(shown).count == 5)
        for (i, id) in shown.enumerated() {
            #expect(!shown[max(0, i - FlashcardSchedule.apart)..<i].contains(id))
        }
    }

    @Test func aPassMovesTheWordAlongAndSpacesIt() {
        var s = FlashcardSchedule()
        _ = feed(&s, 5)
        s.passed("w1", end: 5, now: now)
        #expect(s.stage("w1") == .recall)
        s.passed("w1", end: 9, now: now)
        #expect(s.stage("w1") == .say)
        s.passed("w1", end: 20, now: now)
        #expect(s.isOwn("w1"))
        #expect(s.own["w1"]?.due == FlashcardSchedule.day(1, after: now))
        // Each check passed sends it further away: 3 days, then 7
        s.passed("w1", end: 30, now: now)
        #expect(s.own["w1"]?.due == FlashcardSchedule.day(3, after: now))
        s.passed("w1", end: 31, now: now)
        #expect(s.own["w1"]?.due == FlashcardSchedule.day(7, after: now))
    }

    @Test func aMissComesBackSoonerThanAPass() {
        var s = FlashcardSchedule()
        _ = feed(&s, 5)
        s.passed("w1", end: 5, now: now)   // back at 8
        s.missed("w2", end: 5)             // back at 7
        let next = s.next(from: pool, recent: [], slot: 7, now: now)
        #expect(next == "w2")
    }

    @Test func aMissedCheckTakesAWordBackToSayIt() {
        var s = FlashcardSchedule(own: ["w1": .init(due: now, step: 2)])
        #expect(s.next(from: pool, recent: [], slot: 0, now: now) == "w1")
        s.missed("w1", end: 1)
        #expect(!s.isOwn("w1"))
        #expect(s.stage("w1") == .say)
    }

    @Test func wordsThatAreYoursWaitForTheirDay() {
        var s = FlashcardSchedule(own: ["w1": .init(due: FlashcardSchedule.day(3, after: now), step: 1)])
        let shown = feed(&s, 8)
        #expect(!shown.contains("w1"))
    }

    @Test func everythingYoursStillFillsTheFeed() {
        let own = Dictionary(uniqueKeysWithValues: pool.map { ($0, FlashcardSchedule.Own(due: FlashcardSchedule.day(5, after: now), step: 2)) })
        var s = FlashcardSchedule(own: own)
        let shown = feed(&s, 12)
        #expect(shown.count == 12)
    }
}
