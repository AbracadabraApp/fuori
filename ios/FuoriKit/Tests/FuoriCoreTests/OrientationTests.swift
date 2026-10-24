import Foundation
import Testing
@testable import FuoriCore

/// The orientation tour's lines (content/<country>/onboarding.ts →
/// orientation; docs/orientation-script.md): decoded from /v1/content, the
/// name filled in or left out with its comma, and absent from older servers
@Suite struct OrientationTests {
    private func card(_ line: String, _ en: String, _ note: String? = nil) -> [String: Any] {
        var c: [String: Any] = ["line": line, "en": en]
        if let note { c["note"] = note }
        return c
    }

    @Test func decodesTheTour() throws {
        let url = try #require(Bundle.module.url(forResource: "content-it", withExtension: "json", subdirectory: "Fixtures"))
        var json = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
        var onboarding = try #require(json["onboarding"] as? [String: Any])
        #expect(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).onboarding?.orientation == nil)
        onboarding["orientation"] = [
            "hello": card("Ciao!", "Hi!", "I'll show you how it works."),
            "askName": card("Come ti chiami?", "What's your name? Tap the mic"),
            "niceToMeet": card("Piacere, {name}!", "Nice to meet you, {name}!", "Words can be *masculine* or feminine."),
            "asMan": card("Benvenuto", "Masculine"),
            "asWoman": card("Benvenuta", "Feminine"),
            "welcomeMan": card("Grazie. Benvenuto, {name}!", "Thanks. Welcome, {name}!", "How much do you speak?"),
            "welcomeWoman": card("Grazie. Benvenuta, {name}!", "Thanks. Welcome, {name}!", "How much do you speak?"),
            "askLevel": card("Parli italiano?", "Do you speak Italian?"),
            "levelSet": card("Perfetto!", "Perfect!", "You can change it in Settings."),
            "next": card("Avanti", "Next"),
        ]
        json["onboarding"] = onboarding
        let tour = try #require(try JSONDecoder().decode(Content.self, from: JSONSerialization.data(withJSONObject: json)).onboarding?.orientation)
        #expect(tour.asMan.en == "Masculine")
        #expect(tour.niceToMeet.named("Josh").line == "Piacere, Josh!")
        #expect(tour.niceToMeet.named(nil).line == "Piacere!")
        #expect(tour.niceToMeet.named("Josh").note == "Words can be *masculine* or feminine.")
        #expect(tour.askName.note == nil)
    }
}
