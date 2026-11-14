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

    /// The trip map (content/<country>/travel-map.json): absent from older
    /// servers and from countries without a picture; when sent, it covers a
    /// trip only when both cities have a spot on it
    @Test func decodesTravelMap() throws {
        #expect(try fixture().travelMap == nil)
        let json = #"{"image":"https://img.example/travel/map.webp","aspect":0.6667,"cities":[{"id":"roma-nuova","x":0.45,"y":0.5,"building":"https://img.example/travel/building-roma-nuova.webp"},{"id":"firenze","x":0.4,"y":0.36,"building":null}],"anchors":["firenze"]}"#
        let map = try JSONDecoder().decode(TravelMap.self, from: Data(json.utf8))
        #expect(map.covers(from: "roma-nuova", to: "firenze"))
        #expect(!map.covers(from: "roma-nuova", to: "lecce"))
        #expect(map.spot("firenze")?.building == nil)
        // No layout sent (Italy, older servers): names on the map. "numbered" (Mexico): dots and a key
        #expect(!map.numbered)
        let numbered = try JSONDecoder().decode(TravelMap.self, from: Data(json.replacingOccurrences(of: #""anchors":["firenze"]"#, with: #""anchors":[],"layout":"numbered""#).utf8))
        #expect(numbered.numbered)
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
            "examples": [["role": "barista", "place": "bar", "said": "Naturale o frizzante?", "en": "Still or sparkling?"]],
            "notice": "Vorrei works for anything you ask for.", "context": "",
            "practice": [["ask": ["said": "Cosa Le do?", "en": "What can I get you?"], "answer": ["said": "Vorrei un caffè.", "en": "I'd like a coffee."]]],
        ]]]]
        let content = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        let step = try #require(content.lessons?.first?.steps.first)
        #expect(step.title == "I'd like, politely")
        #expect(step.practice.first?.answer.said == "Vorrei un caffè.")
        #expect(step.examples.first?.role == "barista")
    }

    /// The Learn page's lesson chips (lib/lessons.ts → lessonAreas), and a
    /// server from before them still loads; a chip finds its lesson
    @Test func decodesLessonAreas() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        #expect(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).lessonAreas == nil)
        json["lessons"] = [["id": "a1-04", "title": "Order at the bar", "steps": [[
            "id": "a1-04-3", "title": "I'd like, politely", "how_to": "", "intro": "", "examples": [], "notice": "", "context": "", "practice": [],
        ]]]]
        json["lessonAreas"] = [["name": "Ordering and paying", "chips": [["step": "a1-04-3", "name": "Order politely"]]], ["name": "Sort things out", "set": 2, "chips": [["step": "b1-sort-1", "name": "I need…"]]]]
        let content = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        let chip = try #require(content.lessonAreas?.first?.chips.first)
        #expect(chip.name == "Order politely")
        #expect(content.lessonStep(chip.step)?.title == "I'd like, politely")
        #expect(content.lessonStep("a1-99-9") == nil)
        // Sets: an area without one (servers before sets) is in the first
        #expect(content.lessonAreas?.map(\.lessonSet) == [1, 2])
        #expect(content.culture == nil)
        json["culture"] = [["id": "napoli-the-suspended-coffee", "chip": "Coffee for a stranger", "topic": "traditions"]]
        let withCulture = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        #expect(withCulture.culture?.first?.chip == "Coffee for a stranger")
    }

    /// A cinema's films (lib/cinema.ts): optional on every place, so older servers still decode
    @Test func cinemaFilmsDecode() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        let plain = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        #expect(plain.cities.allSatisfy { $0.places.allSatisfy { $0.films == nil } })
        var cities = try #require(json["cities"] as? [[String: Any]])
        var places = try #require(cities[0]["places"] as? [[String: Any]])
        places[0]["films"] = [["tmdbId": 5156, "title": "Ladri di biciclette", "year": 1948, "poster": "https://example.r2.dev/it/posters/5156.abc.webp",
                               "videos": [["youtube": "_I_LgU9Hw5s", "type": "Trailer", "name": "Trailer Originale", "language": "it"]]]]
        cities[0]["places"] = places
        json["cities"] = cities
        let content = try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json))
        let film = try #require(content.cities[0].places[0].films?.first)
        #expect(film.title == "Ladri di biciclette" && film.year == 1948)
        #expect(film.videos.first?.youtube == "_I_LgU9Hw5s")
    }

    /// The visit stamp's words (content/<country>/language.ts → ui.stamp), and a
    /// server from before them still loads (no stamps then)
    @Test func decodesStampWords() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        var language = try #require(json["language"] as? [String: Any])
        var ui = try #require(language["ui"] as? [String: Any])
        ui["stamp"] = nil
        language["ui"] = ui
        json["language"] = language
        #expect(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).language.ui.stamp == nil)
        ui["stamp"] = ["visited": "già visto", "regular": "di casa", "visitedLabel": "Visited", "regularLabel": "Regular"]
        language["ui"] = ui
        json["language"] = language
        let stamp = try #require(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).language.ui.stamp)
        #expect(stamp.regular == "di casa")
        #expect(stamp.visitedLabel == "Visited")
    }

    /// The welcome (lib/welcome.ts): who plays it, where, and the last
    /// button's words; a server from before it still loads (no welcome then)
    @Test func decodesWelcome() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        var onboarding = try #require(json["onboarding"] as? [String: Any])
        onboarding["welcome"] = nil
        json["onboarding"] = onboarding
        #expect(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).onboarding?.welcome == nil)
        onboarding["welcome"] = ["characterId": "giulia", "cityId": "roma", "placeId": "bar-trastevere", "go": ["line": "Andiamo!", "en": "Let's go!"]]
        json["onboarding"] = onboarding
        let welcome = try #require(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).onboarding?.welcome)
        #expect(welcome.characterId == "giulia")
        #expect(welcome.go.line == "Andiamo!")
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

    /// The cinema shuffler (GET /v1/cinema, trimmed to two shelves of two films):
    /// shelves decode with their films and posters as URLs
    @Test func decodesCinemaShelves() throws {
        let url = try #require(Bundle.module.url(forResource: "cinema-it", withExtension: "json", subdirectory: "Fixtures"))
        let cinema = try JSONDecoder().decode(CinemaShelves.self, from: Data(contentsOf: url))
        #expect(cinema.shelves.count == 2)
        #expect(cinema.shelves.allSatisfy { !$0.title.isEmpty && $0.films.count == 2 })
        #expect(cinema.shelves.flatMap(\.films).allSatisfy { $0.poster != nil && !$0.videos.isEmpty })
        // The film page: the labels, and each film's WhyWatch with its reasons
        #expect(cinema.labels != nil)
        #expect(cinema.shelves.flatMap(\.films).allSatisfy { ($0.whyWatch?.reasons.count ?? 0) >= 2 })
        // The translate link: an English line for every reason, and the context
        #expect(cinema.shelves.flatMap(\.films).allSatisfy { $0.whyWatch?.en?.reasons.count == $0.whyWatch?.reasons.count && !($0.whyWatch?.en?.context ?? "").isEmpty })
    }
}
