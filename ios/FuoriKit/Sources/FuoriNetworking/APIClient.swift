import Foundation
import FuoriCore
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// Where the token lives between launches (the app uses the Keychain)
public protocol TokenStore: Sendable {
    func load() -> String?
    func save(_ token: String)
}

/// The server's /v1 API (docs/12-native-app.md). Signs in on first use and
/// sends the device token with every call. Never holds API keys: Claude,
/// Whisper and the voices are called by the server.
public actor APIClient {
    public let baseURL: URL
    private let tokens: TokenStore
    private let session: URLSession
    private var token: String?

    public init(baseURL: URL, tokens: TokenStore, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.tokens = tokens
        self.session = session
        self.token = tokens.load()
    }

    /// GET /v1/content: no sign-in needed
    public func content() async throws -> Content {
        try await send(request("v1/content"), signedIn: false)
    }

    public struct Me: Codable, Sendable {
        public let learnerId: String
        public let country: String
        public let visits: [String: Int]
    }

    /// GET /v1/me: the learner and their visit counts per place
    public func me() async throws -> Me {
        try await send(request("v1/me"), signedIn: true)
    }

    // MARK: - Plumbing

    private struct Device: Codable { let learnerId: String; let token: String }

    /// Sign in once per device: POST /v1/auth/device
    private func ensureToken() async throws -> String {
        if let token { return token }
        var req = request("v1/auth/device")
        req.httpMethod = "POST"
        let device: Device = try await send(req, signedIn: false)
        tokens.save(device.token)
        token = device.token
        return device.token
    }

    private func request(_ path: String) -> URLRequest {
        var req = URLRequest(url: baseURL.appending(path: path))
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        return req
    }

    private func send<T: Decodable>(_ request: URLRequest, signedIn: Bool) async throws -> T {
        var req = request
        if signedIn { req.setValue("Bearer \(try await ensureToken())", forHTTPHeaderField: "Authorization") }
        let (data, response) = try await session.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else {
            let error = APIError.from(data: data, status: status)
            // A revoked or unknown token: forget it, so the next call signs in again
            if error.code == .unauthorized { token = nil }
            throw error
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
