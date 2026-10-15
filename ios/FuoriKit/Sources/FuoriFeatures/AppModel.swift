import Foundation
import Observation
import FuoriCore
import FuoriNetworking

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

    private let api: APIClient

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
        } catch let error as APIError {
            phase = .failed(error.message)
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }
}
