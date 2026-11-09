import Foundation
import Testing
@testable import FuoriCore

/// The daily order of a city's places and of the cities (DailyOrder; Josh,
/// 2026-11-08: the fixed order put a bar first in most cities)
@Suite struct DailyOrderTests {
    /// Places from JSON, as the server sends them; kinds and ids are made up
    func places(_ list: [(String, String, Bool)]) throws -> [Place] {
        let json = list.map { #"{"id":"\#($0.0)","name":"\#($0.0)","kind":"\#($0.1)","neighbourhood":"n","station":false,"open":\#($0.2)}"# }
        return try JSONDecoder().decode([Place].self, from: Data("[\(json.joined(separator: ","))]".utf8))
    }

    func sample() throws -> [Place] {
        try places([("a", "shop", false), ("b", "shop", false), ("c", "shop", false), ("d", "stall", false),
                    ("e", "stall", false), ("f", "counter", false), ("g", "square", true), ("h", "counter", false)])
    }

    @Test func sameDaySameOrder() throws {
        let p = try sample()
        let one = DailyOrder.places(p, visits: [:], day: "2026-11-08", cityId: "x").map(\.id)
        #expect(one == DailyOrder.places(p, visits: [:], day: "2026-11-08", cityId: "x").map(\.id))
        #expect(Set(one) == Set(p.map(\.id)), "every place shown once")
    }

    @Test func changesFromDayToDay() throws {
        let p = try sample()
        let days = (1...10).map { DailyOrder.places(p, visits: [:], day: "2026-11-\($0)", cityId: "x").map(\.id) }
        #expect(Set(days.map { $0.first! }).count > 1, "the first card isn't the same every day")
    }

    @Test func unvisitedFirst() throws {
        let p = try sample()
        let visits = ["a": 2, "d": 1]
        let order = DailyOrder.places(p, visits: visits, day: "2026-11-08", cityId: "x").map(\.id)
        #expect(Set(order.prefix(6)) == ["b", "c", "e", "f", "g", "h"], "got \(order)")
    }

    @Test func anOpenSpaceInTheFirstThree() throws {
        let p = try sample()
        for day in 1...30 {
            let order = DailyOrder.places(p, visits: [:], day: "2026-11-\(day)", cityId: "x")
            #expect(order.prefix(3).contains { $0.open == true }, "day \(day): \(order.map(\.id))")
        }
    }

    @Test func noKindTwiceInARowWhenAvoidable() throws {
        let p = try sample()
        for day in 1...30 {
            let kinds = DailyOrder.places(p, visits: [:], day: "2026-11-\(day)", cityId: "x").map(\.kind)
            #expect(!zip(kinds, kinds.dropFirst()).prefix(5).contains { $0 == $1 }, "day \(day): \(kinds)")
        }
    }

    @Test func aVisitedOpenSpaceStillComesUpWhenItIsTheOnlyOne() throws {
        let p = try sample()
        let order = DailyOrder.places(p, visits: ["g": 3], day: "2026-11-08", cityId: "x")
        #expect(order.prefix(3).contains { $0.id == "g" }, "got \(order.map(\.id))")
    }

    @Test func citiesNotVisitedFirst() throws {
        let json = #"[{"id":"r","name":"r","more":false,"places":[{"id":"r1","name":"r1","kind":"k","neighbourhood":"n","station":false}]},{"id":"s","name":"s","more":false,"places":[{"id":"s1","name":"s1","kind":"k","neighbourhood":"n","station":false}]},{"id":"t","name":"t","more":false,"places":[]}]"#
        let cities = try JSONDecoder().decode([City].self, from: Data(json.utf8))
        for day in 1...10 {
            #expect(DailyOrder.cities(cities, visits: ["r1": 1], day: "2026-11-\(day)").last?.id == "r")
        }
    }

    @Test func todayIsTheLocalDate() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "America/Los_Angeles")!
        // 2026-11-09 03:00 UTC is still the 8th in California
        #expect(DailyOrder.today(Date(timeIntervalSince1970: 1_794_193_200), calendar: calendar) == "2026-11-08")
    }
}
