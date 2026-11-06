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
    /// Flashcards' starter words (docs/flashcards.md); nil from servers before 2026-10-27
    public let flashcards: [Flashcard]?
    /// The master deck: tall 2:3 pictures and a recording per word; nil from
    /// servers before 2026-10-28 (then the starter words above)
    public let cards: [Flashcard]?
    /// The syllabus lessons for Learn's Lessons card (lib/lessons.ts); nil from
    /// servers before 2026-10-29, empty where a country has none yet
    public let lessons: [LessonUnit]?
    /// The Learn page's lessons as chips in their areas (lib/lessons.ts →
    /// lessonAreas); nil from servers before 2026-11-03
    public let lessonAreas: [LessonArea]?
    /// The Learn page's cultural lessons, outside the lesson sets (lib/culture.ts); nil from servers before 2026-11-04
    public let culture: [CultureChip]?
    /// The country has a cinema shuffler (GET /v1/cinema), opened by the film reel by Learn; nil from servers before 2026-11-06
    public let cinema: Bool?
    public let characters: [String: Character]

    /// A lesson by its step id
    public func lessonStep(_ id: String) -> LessonStep? { lessons?.lazy.flatMap(\.steps).first { $0.id == id } }

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
    /// Learn home: the Lessons card's button ("Sì, dai"); nil from servers before 2026-10-26
    public let letsDoIt: String?
    /// Flashcards: each stage's instruction ("Ripeti", "Come si dice?",
    /// "Che cos'è?"); nil from servers before 2026-10-29
    public let cards: CardWords?
    /// Visit stamps on place and city cards; nil from servers before 2026-10-30
    public let stamp: StampWords?
    /// A lesson's buttons; nil from servers before 2026-11-02
    public let lesson: LessonWords?
    public let ticket: TicketWords
}

/// A lesson's buttons (lib/lesson.ts), in the language, with their English
/// for VoiceOver: after Magda teaches, between practice scenes, back to her
/// review, at the end
public struct LessonWords: Codable, Sendable, Equatable {
    public let go: String
    public let next: String
    public let back: String
    public let done: String
    public let goLabel: String
    public let nextLabel: String
    public let backLabel: String
    public let doneLabel: String
}

/// The visit stamp's words (docs/visited-badge.md): in the language on the
/// stamp, the English label under it
public struct StampWords: Codable, Sendable, Equatable {
    public let visited: String
    public let regular: String
    public let visitedLabel: String
    public let regularLabel: String
}

public struct CardWords: Codable, Sendable, Equatable {
    public let `repeat`: String
    public let howDoYouSay: String
    public let whatIsIt: String
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
    /// A cinema's films (lib/cinema.ts); nil for every other place and from servers before 2026-11-06
    public let films: [Film]?
    /// A food place's menu or board, in the language (Osteria da Nino, the Sorbetteria); nil elsewhere
    public let menu: [String]?
    /// Where the picture's blank board is, as fractions of the square feed
    /// picture: the menu is written on it (Osteria da Nino); nil elsewhere
    public let menuBoard: Board?

    public struct Board: Codable, Sendable, Equatable, Hashable {
        public let x: Double
        public let y: Double
        public let width: Double
        public let height: Double
    }
}

/// A film showing at a cinema: its poster and its videos, the official trailer first (TMDB data, served by Fuori)
public struct Film: Codable, Sendable, Equatable, Identifiable, Hashable {
    public struct Video: Codable, Sendable, Equatable, Identifiable, Hashable {
        /// The YouTube video id
        public let youtube: String
        /// TMDB's kind: Trailer, Teaser, Featurette, Clip
        public let type: String
        public let name: String
        /// ISO 639-1 code of the video's language
        public let language: String
        public var id: String { youtube }
    }
    public let tmdbId: Int
    public let title: String
    public let year: Int
    public let poster: URL?
    public let videos: [Video]
    /// The film page (the cinema shuffler's films only; nil elsewhere): MovieGenius's
    /// WhyWatch in the learned language
    public let whyWatch: WhyWatch?
    /// The film page's More Ideas: films in the library, each with why it's like this one
    public let moreIdeas: [Idea]?
    public var id: Int { tmdbId }

    public struct WhyWatch: Codable, Sendable, Equatable, Hashable {
        /// "YES" or "NO"
        public let recommendation: String
        public let reasons: [String]
        public let context: String
        /// The English for the translate link (nil from servers before 2026-11-06)
        public let en: Translation?
        public var recommended: Bool { recommendation == "YES" }

        public struct Translation: Codable, Sendable, Equatable, Hashable {
            public let reasons: [String]
            public let context: String
        }
    }

    public struct Idea: Codable, Sendable, Equatable, Hashable {
        public let tmdbId: Int
        public let connection: String
    }
}

/// The cinema shuffler's shelves (GET /v1/cinema; Josh, 2026-11-06, experimental,
/// not linked from the game yet): rows of films, each film as at a cinema
public struct CinemaShelves: Codable, Sendable, Equatable {
    public struct Shelf: Codable, Sendable, Equatable, Identifiable, Hashable {
        public let id: String
        /// The shelf's name, in the learned language, from the server
        public let title: String
        public let films: [Film]
    }
    /// The film page's words in the learned language, from the server
    public struct Labels: Codable, Sendable, Equatable, Hashable {
        public let yes: String
        public let no: String
        public let moreIdeas: String
    }
    public let labels: Labels?
    public let shelves: [Shelf]
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

    /// The orientation tour (docs/orientation-script.md; Josh, 2026-10-23),
    /// steps 1–3: her line and its English, then a note in English (app
    /// chrome; *word* is italic). {name} is filled in by the app
    public struct Card: Codable, Sendable, Equatable {
        public let line: String
        public let en: String
        public let note: String?

        public var said: Line { Line(line: line, en: en) }

        public func named(_ name: String?) -> Card {
            let filled = said.named(name)
            return Card(line: filled.line, en: filled.en, note: note)
        }

        public init(line: String, en: String, note: String?) { self.line = line; self.en = en; self.note = note }
    }

    public struct Orientation: Codable, Sendable, Equatable {
        public let hello: Card
        public let askName: Card
        public let niceToMeet: Card
        public let asMan: Card
        public let asWoman: Card
        public let welcomeMan: Card
        public let welcomeWoman: Card
        public let askLevel: Card
        public let levelSet: Card
        public let next: Card
        /// Cards 4–7 (Josh, 2026-10-23); nil from servers before them, when
        /// the tour ends after the level
        public let trip: Card?
        public let sayIt: Card?
        /// Card 5's example: `en` is what was said, `line` the line to read
        public let sayItExample: Card?
        public let help: Card?
        /// Card 6, beside the Learn book
        public let learn: String?
        public let ready: Card?
        public let go: Card?
    }

    /// The welcome conversation (lib/welcome.ts; docs/onboarding-giulia.md):
    /// who plays it, where, and the last button's words, in the language
    public struct Welcome: Codable, Sendable, Equatable {
        public let characterId: String
        public let cityId: String
        public let placeId: String
        public let go: Line
    }

    public let guide: Guide
    public let lines: Lines
    /// nil from servers before 2026-10-23: today's onboarding then
    public let orientation: Orientation?
    /// nil from servers before 2026-11-02, or a country without one
    public let welcome: Welcome?
}

/// A flashcard (docs/flashcards.md): the word as shown and said, with its
/// article ("il banco"), its English, its picture if there is one (tall 2:3
/// in the master deck, 2:1 in the old starter words) and the word recorded
/// once (master deck only)
public struct Flashcard: Codable, Sendable, Equatable, Hashable, Identifiable {
    public let id: String
    public let said: String
    public let en: String
    public let picture: URL?
    public let audio: URL?

    public init(id: String, said: String, en: String, picture: URL?, audio: URL? = nil) {
        self.id = id; self.said = said; self.en = en; self.picture = picture; self.audio = audio
    }
}

/// One syllabus unit's lessons, one per step (content/<country>/lessons.json;
/// docs/learn.md, docs/teach-plan.md). Shown in Learn until Magda teaches them
/// on the conversation screen (docs/learn.md → A lesson)
public struct LessonUnit: Codable, Sendable, Equatable, Hashable, Identifiable {
    public let id: String
    public let title: String
    public let steps: [LessonStep]
}

/// A cultural lesson on the Learn page: one particular thing about a city,
/// told by the person there whose pride it is (docs/culture.md)
public struct CultureChip: Codable, Sendable, Equatable, Hashable, Identifiable {
    public let id: String
    /// At most four English words
    public let chip: String
    public let topic: String
}

/// The Learn page's lessons in an area (Josh, 2026-11-03): each chip is a
/// lesson, named for what it lets you do (content/<country>/lesson-areas.json)
public struct LessonArea: Codable, Sendable, Equatable, Hashable {
    public struct Chip: Codable, Sendable, Equatable, Hashable { public let step: String; public let name: String }
    public let name: String
    /// The Learn page shows one set at a time (Josh, 2026-11-03); nil from servers before sets: 1
    public let set: Int?
    public let chips: [Chip]

    public var lessonSet: Int { self.set ?? 1 }
}

public struct LessonStep: Codable, Sendable, Equatable, Hashable, Identifiable {
    /// `said` is in the language being learned
    public struct Line: Codable, Sendable, Equatable, Hashable { public let said: String; public let en: String }
    public struct Example: Codable, Sendable, Equatable, Hashable { public let role: String; public let place: String; public let said: String; public let en: String }
    public struct Practice: Codable, Sendable, Equatable, Hashable { public let ask: Line; public let answer: Line }
    public let id: String
    public let title: String
    public let how_to: String
    public let intro: String
    public let examples: [Example]
    public let notice: String
    public let context: String
    public let practice: [Practice]
}
