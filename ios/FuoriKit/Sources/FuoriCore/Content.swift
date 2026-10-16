import Foundation

/// What the server says the app shows: GET /v1/content (lib/content-api.ts).
/// Display fields only; prompts and voices stay on the server. Words in the
/// language being learned come from `language.ui`, never from Swift literals.
public struct Content: Codable, Sendable, Equatable {
    public let version: String
    public let country: String
    /// The country's card in the country choice and Settings; nil from servers before 2026-10-16
    public let card: CountryCard?
    public let language: Language
    public let ticketTheme: TicketTheme
    public let cities: [City]
    public let characters: [String: Character]

    public func city(_ id: String) -> City? { cities.first { $0.id == id } }
    public func character(_ id: String?) -> Character? { id.flatMap { characters[$0] } }

    /// The city list: first-screen cities, then the rest after "show more"
    public var firstScreenCities: [City] { cities.filter { !$0.more } }
    public var moreCities: [City] { cities.filter(\.more) }
}

/// A country as a card: its name and a line in English (app chrome), and its picture
public struct CountryCard: Codable, Sendable, Equatable {
    public let country: String
    public let learn: String
    public let image: URL?
}

public struct Language: Codable, Sendable, Equatable {
    public let code: String
    public let name: String
    /// Locale for the phone's own voice and speech (e.g. for AVSpeechSynthesizer)
    public let speechLang: String
    public let appName: String
    public let ui: UIWords
}

/// Interface words in the language being learned (content/<country>/language.ts)
public struct UIWords: Codable, Sendable, Equatable {
    public let showMore: String
    public let whereTo: String
    public let youAreHere: String
    public let ticket: TicketWords
}

public struct TicketWords: Codable, Sendable, Equatable {
    public let vehicle: String
    public let carrier: String
    public let service: String
    public let platform: String
    public let seat: String
    public let fareLabel: String
    public let fare: String
    public let board: String
}

public struct TicketTheme: Codable, Sendable, Equatable {
    public let band: String
    public let bandInk: String
    public let stripe: String
    public let accent: String
}

public struct City: Codable, Sendable, Equatable, Identifiable, Hashable {
    public let id: String
    public let name: String
    public let region: String?
    /// Shown after "show more" rather than on the first screen
    public let more: Bool
    public let image: URL?
    public let places: [Place]
}

public struct Place: Codable, Sendable, Equatable, Identifiable, Hashable {
    public let id: String
    public let name: String
    public let kind: String
    public let neighbourhood: String
    /// Opens the departures board instead of a conversation
    public let station: Bool
    /// Who you meet here; nil when nobody is there yet
    public let characterId: String?
    public let image: URL?
}

public struct Character: Codable, Sendable, Equatable, Identifiable, Hashable {
    public let id: String
    public let name: String
    public let role: String
    public let gender: String?
    /// Teaches (Magda)
    public let tutor: Bool
    public let portrait: URL?
}
