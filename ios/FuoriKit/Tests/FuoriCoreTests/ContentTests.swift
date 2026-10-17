import Foundation
import Testing
@testable import FuoriCore

/// The app reads what the server sends: a trimmed copy of GET /v1/content
/// (Italy, 2 cities) decodes, and the city list splits first-screen cities
/// from the ones after "show more".
@Suite struct ContentTests {
    func fixture() throws -> Content {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        return try JSONDecoder().decode(Content.self, from: Data(contentsOf: url))
    }

    @Test func decodesServerContent() throws {
        let content = try fixture()
        #expect(content.cities.count == 2)
        #expect(!content.language.ui.showMore.isEmpty)
        #expect(content.cities.allSatisfy { $0.image?.pathExtension == "webp" })
    }

    @Test func everyPlacesPersonIsListed() throws {
        let content = try fixture()
        for place in content.cities.flatMap(\.places) {
            if let id = place.characterId { #expect(content.character(id) != nil, "\(id) missing") }
        }
    }

    @Test func splitsFirstScreenAndMore() throws {
        let content = try fixture()
        #expect(content.firstScreenCities.count == 1)
        #expect(content.moreCities.count == 1)
    }

    /// The greeter: her lines, four poses and the lift (docs/onboarding-design.md)
    @Test func decodesOnboarding() throws {
        let onboarding = try #require(try fixture().onboarding)
        #expect(!onboarding.lines.welcome.line.isEmpty && !onboarding.lines.welcome.en.isEmpty)
        #expect(!onboarding.lines.help.line.isEmpty)
        let poses = [onboarding.guide.poses.welcome, onboarding.guide.poses.listen, onboarding.guide.poses.talk, onboarding.guide.poses.laugh]
        #expect(poses.allSatisfy { $0 != nil })
        #expect(onboarding.guide.lift >= 0 && onboarding.guide.lift < 0.5)
    }

    /// A server from before onboarding sends no block: the app still loads (and shows no greeter)
    @Test func decodesWithoutOnboarding() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        json["onboarding"] = nil
        let content = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        #expect(content.onboarding == nil)
    }
}
