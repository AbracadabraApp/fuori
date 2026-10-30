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

    /// The syllabus lessons for Learn (lib/lessons.ts) as the server sends
    /// them, and a server from before them still loads
    @Test func decodesLessons() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        #expect(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).lessons == nil)
        json["lessons"] = [["id": "a1-04", "title": "Order at the bar", "steps": [[
            "id": "a1-04-3", "title": "I'd like, politely", "how_to": "How to ask politely.", "intro": "You'll be able to ask for things.",
            "examples": [["role": "barista", "place": "bar", "it": "Naturale o frizzante?", "en": "Still or sparkling?"]],
            "notice": "Vorrei works for anything you ask for.", "context": "",
            "practice": [["ask": ["it": "Cosa Le do?", "en": "What can I get you?"], "answer": ["it": "Vorrei un caffè.", "en": "I'd like a coffee."]]],
        ]]]]
        let content = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        let step = try #require(content.lessons?.first?.steps.first)
        #expect(step.title == "I'd like, politely")
        #expect(step.practice.first?.answer.it == "Vorrei un caffè.")
        #expect(step.examples.first?.role == "barista")
    }

    /// Name and address (docs/onboarding-design.md): the six lines as the
    /// server sends them (content/<country>/onboarding.ts), and {name} filled
    /// in, or left out with its comma when they skipped the name
    @Test func decodesAddressLines() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        var onboarding = try #require(json["onboarding"] as? [String: Any])
        var lines = try #require(onboarding["lines"] as? [String: Any])
        #expect(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).onboarding?.lines.addressLines == nil)
        lines["askName"] = ["line": "Come ti chiami? Tocca il microfono e dimmi il tuo nome.", "en": "What's your name? Tap the microphone and tell me your name."]
        lines["address"] = ["line": "Piacere, {name}! A una donna dico «benvenuta», a un uomo «benvenuto». Per te?", "en": "Nice to meet you, {name}! To a woman I say benvenuta, to a man benvenuto. Which for you?"]
        lines["asWoman"] = ["line": "Benvenuta!", "en": "to a woman"]
        lines["asMan"] = ["line": "Benvenuto!", "en": "to a man"]
        lines["welcomeWoman"] = ["line": "Benvenuta, {name}!", "en": "Welcome, {name}!"]
        lines["welcomeMan"] = ["line": "Benvenuto, {name}!", "en": "Welcome, {name}!"]
        onboarding["lines"] = lines
        json["onboarding"] = onboarding
        let content = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        let address = try #require(content.onboarding?.lines.addressLines)
        #expect(address.asWoman.line == "Benvenuta!")
        #expect(address.welcomeMan.named("Giosuè").line == "Benvenuto, Giosuè!")
        #expect(address.welcomeMan.named("Giosuè").en == "Welcome, Giosuè!")
        #expect(address.welcomeWoman.named(nil).line == "Benvenuta!")
        #expect(address.address.named(nil).line.hasPrefix("Piacere! A una donna"))
        #expect(address.address.named(nil).en.hasPrefix("Nice to meet you! To a woman"))
    }
}
