import Foundation
import FuoriCore
import FuoriNetworking
import FuoriAudio

/// What the Learn sheet needs: a conversation's page, its character and
/// place, and saying a line in the character's voice. A conversation in
/// progress (ConversationModel) or a past one from the Learn area
/// (PastConversationLearn) shows the same page.
@MainActor
protocol LearnSource: AnyObject {
    var character: Character { get }
    var place: Place { get }
    var speechLanguage: String { get }
    /// The line being said, so its row shows it
    var learnSaying: String? { get }
    func learnPage() async throws -> APIClient.LearnPage
    func sayForLearn(_ text: String) async
    func closeLearn()
}

extension ConversationModel: LearnSource {}

/// A past conversation's page, opened from the Learn area (docs/learn.md →
/// The Learn area; Josh, 2026-10-26). The page comes from POST /v1/learn, as
/// in the conversation; lines are said in the character's voice, the
/// phone's own if the hosted one fails.
@MainActor
@Observable
final class PastConversationLearn: LearnSource, Identifiable {
    let id: String
    let character: Character
    let place: Place
    private let cityId: String
    private let language: Language
    private let api: APIClient
    private let voice = Voice()
    private(set) var learnSaying: String?

    var speechLanguage: String { language.speechLang }
    /// Slower with English on, as in the conversation
    private var speed: Double { UserDefaults.standard.bool(forKey: SettingsKey.english) ? 0.7 : 0.9 }

    init(conversation: APIClient.PastConversation, character: Character, place: Place, language: Language, api: APIClient) {
        self.id = conversation.id
        self.cityId = conversation.cityId
        self.character = character
        self.place = place
        self.language = language
        self.api = api
    }

    func learnPage() async throws -> APIClient.LearnPage {
        try await api.learn(cityId: cityId, placeId: place.id, conversationId: id)
    }

    func sayForLearn(_ text: String) async {
        voice.stop()
        learnSaying = text
        do {
            let audio = try await api.speak(text: text, characterId: character.id, speed: speed)
            guard learnSaying == text else { return }
            try AudioSession.activate()
            try await voice.play(audio)
        } catch {
            guard learnSaying == text else { return }
            await voice.speak(text, language: language.speechLang, rate: Float(speed))
        }
        if learnSaying == text { learnSaying = nil }
    }

    func closeLearn() {
        learnSaying = nil
        voice.stop()
    }
}
