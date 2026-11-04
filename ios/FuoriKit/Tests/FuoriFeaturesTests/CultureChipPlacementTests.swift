import Foundation
import Testing
import FuoriCore
@testable import FuoriFeatures

/// The culture chips sit among the lesson chips, not in a section of their own (docs/culture.md → The chips)
struct CultureChipPlacementTests {
    private func decode<T: Decodable>(_ json: String) throws -> T { try JSONDecoder().decode(T.self, from: Data(json.utf8)) }

    @Test func everyCultureChipLandsInAnAreaAndNoLessonIsLost() throws {
        let areas: [LessonArea] = try decode("""
        [{"name":"Meeting people","chips":[{"step":"a1","name":"Hello"},{"step":"a2","name":"Be polite"}]},
         {"name":"Getting by","chips":[{"step":"b1","name":"Slower"}]}]
        """)
        let culture: [CultureChip] = try decode("""
        [{"id":"c1","chip":"Coffee for a stranger","topic":"traditions"},
         {"id":"c2","chip":"Cavour's table","topic":"history"},
         {"id":"c3","chip":"Candles at the Arena","topic":"art"}]
        """)
        let rows = ChipAreas.items(areas, culture: culture)
        #expect(rows.map { $0.map(\.id) } == [["a1", "c1", "a2", "c3"], ["b1", "c2"]])
        #expect(ChipAreas.items(areas, culture: []).map { $0.map(\.id) } == [["a1", "a2"], ["b1"]])
        #expect(ChipAreas.items([], culture: culture).isEmpty)
    }
}
