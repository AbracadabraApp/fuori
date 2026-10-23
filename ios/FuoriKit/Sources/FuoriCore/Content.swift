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
    /// The greeter; nil from servers before 2026-10-17 (then there's no onboarding)
    public let onboarding: Onboarding?
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
    /// Say it in English: the label on what the learner said ("Come si dice:");
    /// nil from servers before 2026-10-23
    public let howToSay: String?
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

/// The greeter (docs/onboarding-design.md): her fixed lines in the language
/// being learned, each with its English, her four poses and how far to lift
/// her picture so her face stays clear of the text
public struct Onboarding: Codable, Sendable, Equatable {
    public struct Line: Codable, Sendable, Equatable {
        public let line: String
        public let en: String
        public init(line: String, en: String) { self.line = line; self.en = en }

        /// With the learner's name in place of {name}; without one, the name
        /// and the comma before it are left out ("Piacere!", "Welcome!")
        public func named(_ name: String?) -> Line {
            func fill(_ s: String) -> String {
                guard let name, !name.isEmpty else {
                    return s.replacingOccurrences(of: ", {name}", with: "").replacingOccurrences(of: " {name}", with: "").replacingOccurrences(of: "{name}", with: "")
                }
                return s.replacingOccurrences(of: "{name}", with: name)
            }
            return Line(line: fill(line), en: fill(en))
        }
    }

    /// Name and address (docs/onboarding-design.md → Name and address): her
    /// question for the name, how she'd welcome a woman or a man, the two
    /// buttons and her welcome after the tap. {name} is filled in by the app
    public struct AddressLines: Sendable, Equatable {
        public let askName: Line
        public let address: Line
        public let asWoman: Line
        public let asMan: Line
        public let welcomeWoman: Line
        public let welcomeMan: Line
    }

    public struct Lines: Codable, Sendable, Equatable {
        public let welcome: Line
        /// "Not yet!": the beginner path
        public let notYet: Line
        /// "Yes, but I want to improve": the speaker path
        public let some: Line
        public let beginnerSendOff: Line
        public let go: Line
        /// The speaker path's open question
        public let question: Line
        /// Ends every send-off (the server adds it to hers)
        public let help: Line
        /// Name and address; nil from servers before 2026-10-21
        public let askName: Line?
        public let address: Line?
        public let asWoman: Line?
        public let asMan: Line?
        public let welcomeWoman: Line?
        public let welcomeMan: Line?

        /// All six, or nil if this server doesn't send them
        public var addressLines: AddressLines? {
            guard let askName, let address, let asWoman, let asMan, let welcomeWoman, let welcomeMan else { return nil }
            return AddressLines(askName: askName, address: address, asWoman: asWoman, asMan: asMan, welcomeWoman: welcomeWoman, welcomeMan: welcomeMan)
        }
    }

    public struct Poses: Codable, Sendable, Equatable {
        public let welcome: URL?
        public let listen: URL?
        public let talk: URL?
        public let laugh: URL?
    }

    public struct Guide: Codable, Sendable, Equatable {
        /// Her id for /v1/speak (her own voice)
        public let id: String
        /// Share of the screen height her picture is lifted
        public let lift: Double
        public let poses: Poses
    }

    public let guide: Guide
    public let lines: Lines
}
