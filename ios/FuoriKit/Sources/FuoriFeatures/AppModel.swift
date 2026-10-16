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
        } catch {
            let code = report(error, step: "load")
            let message = (error as? APIError)?.message ?? error.localizedDescription
            phase = .failed(ErrorCode.message(message, code: code))
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
                // Kept in the pending list and retried at the next launch
                report(error, step: "save", context: ["conversationId": id])
            }
            #if canImport(UIKit)
            UIApplication.shared.endBackgroundTask(task)
            #endif
        }
    }

    /// Sends the error to the server log (/v1/log) and returns its code
    @discardableResult
    private func report(_ error: Error, step: String, context: [String: String]? = nil) -> String {
        let code = (error as? APIError)?.requestId ?? ErrorCode.make()
        let report = APIClient.ErrorReport(id: code, step: step, error: error, context: context)
        Task { [api] in await api.report(report) }
        return code
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
