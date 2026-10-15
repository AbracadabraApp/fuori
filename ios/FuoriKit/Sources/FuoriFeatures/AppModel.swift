import Foundation
import Observation
import FuoriCore
import FuoriNetworking
#if canImport(UIKit)
import UIKit
#endif

/// The app's state: the content from the server and the learner's visits.
/// One per app; screens read it from the environment.
@MainActor
@Observable
public final class AppModel {
    public enum Phase: Equatable {
        case loading
        case ready
        case failed(String)
    }

    public private(set) var phase: Phase = .loading
    public private(set) var content: Content?
    public private(set) var visits: [String: Int] = [:]

    let api: APIClient
    /// Conversations whose save failed, retried at the next launch
    private static let pendingKey = "conversations.pendingSave"

    public init(api: APIClient) {
        self.api = api
    }

    /// Load the content, then the learner's visits (signing in on first launch).
    /// A failure is shown on screen with the server's message, never swallowed.
    public func load() async {
        phase = .loading
        do {
            content = try await api.content()
            visits = try await api.me().visits
            phase = .ready
            retryPendingSaves()
        } catch let error as APIError {
            phase = .failed(error.message)
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }

    /// Saves a conversation when the learner leaves it: the character writes
    /// what they remember (POST /v1/conversations/{id}/end). Runs on after the
    /// app goes to the background for as long as iOS allows. A failed save is
    /// kept and retried at the next launch, never dropped.
    public func save(conversationId id: String) {
        var pending = Set(UserDefaults.standard.stringArray(forKey: Self.pendingKey) ?? [])
        pending.insert(id)
        UserDefaults.standard.set(Array(pending), forKey: Self.pendingKey)
        #if canImport(UIKit)
        let task = UIApplication.shared.beginBackgroundTask(withName: "save conversation")
        #endif
        Task {
            do {
                try await api.endConversation(id)
                var pending = Set(UserDefaults.standard.stringArray(forKey: Self.pendingKey) ?? [])
                pending.remove(id)
                UserDefaults.standard.set(Array(pending), forKey: Self.pendingKey)
                visits = (try? await api.me().visits) ?? visits
            } catch {
                print("Fuori: saving conversation \(id) failed, will retry at next launch: \(error)")
            }
            #if canImport(UIKit)
            UIApplication.shared.endBackgroundTask(task)
            #endif
        }
    }

    private func retryPendingSaves() {
        for id in UserDefaults.standard.stringArray(forKey: Self.pendingKey) ?? [] {
            save(conversationId: id)
        }
    }

    func conversation(city: City, place: Place, character: Character) -> ConversationModel? {
        guard let content else { return nil }
        return ConversationModel(city: city, place: place, character: character, language: content.language, api: api) { [weak self] id in
            self?.save(conversationId: id)
        }
    }
}
