import Foundation
import Testing
@testable import FuoriNetworking

/// The level-up offer as the server sends it (docs/bugs.md B42): who asks and
/// the bar of steps arrive with it, and an offer from a server before them
/// still decodes, so the page can fall back to the character just talked with
@Suite struct LevelUpOfferTests {
    private let base = #""step":1,"nextStep":2,"to":"step","character":{"id":"andres-ochoa","name":"Andrés Ochoa","role":"estudiante"},"place":"Hospicio Cabañas","city":"Guadalajara","now":{"line":"a","en":"b"},"next":{"line":"c","en":"d"}"#

    @Test func decodesTheAskerAndTheBar() throws {
        let json = "{" + base + #","asker":{"id":"chela-chapulines","name":"Doña Chela Martínez"},"bar":{"total":6,"now":1,"next":2}}"#
        let offer = try JSONDecoder().decode(APIClient.LevelUp.self, from: Data(json.utf8))
        #expect(offer.asker?.id == "chela-chapulines")
        #expect(offer.asker?.name == "Doña Chela Martínez")
        #expect(offer.bar?.total == 6)
        #expect(offer.bar?.now == 1)
        #expect(offer.bar?.next == 2)
    }

    @Test func anEarlierServersOfferStillDecodes() throws {
        let offer = try JSONDecoder().decode(APIClient.LevelUp.self, from: Data(("{" + base + "}").utf8))
        #expect(offer.asker == nil)
        #expect(offer.bar == nil)
        #expect(offer.character.name == "Andrés Ochoa")
    }
}
