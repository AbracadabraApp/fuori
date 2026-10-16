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
        try await send(request("v1/content", timeout: Self.loadTimeout), signedIn: false)
    }

    /// Loading a country (content, then the learner) gives up after this, so a
    /// stalled connection shows "Can't reach the server" with Try Again rather
    /// than a spinner for a minute (URLSession's default)
    static let loadTimeout: TimeInterval = 20

    public struct Me: Codable, Sendable {
        public let learnerId: String
        public let country: String
        public let visits: [String: Int]
    }

    /// GET /v1/me: the learner and their visit counts per place
    public func me() async throws -> Me {
        try await send(request("v1/me", timeout: Self.loadTimeout), signedIn: true)
    }

    // MARK: - Conversation

    public struct TurnReply: Codable, Sendable, Equatable {
        /// What the character says, in the language being learned
        public let line: String
        public let en: String
        /// The recorded conversation; nil when the server couldn't record it
        public let conversationId: String?
        public let promptVersion: String
    }

    /// POST /v1/turn. Without a conversation id: the character's opening line.
    /// With one: the learner's line and the reply. The server works out the
    /// character from the ids and keeps the transcript.
    public func turn(cityId: String, placeId: String, tripTo: String? = nil, conversationId: String? = nil, learnerSaid: String? = nil) async throws -> TurnReply {
        struct Body: Encodable { let cityId: String; let placeId: String; let tripTo: String?; let conversationId: String?; let learnerSaid: String? }
        return try await send(post("v1/turn", json: Body(cityId: cityId, placeId: placeId, tripTo: tripTo, conversationId: conversationId, learnerSaid: learnerSaid)), signedIn: true)
    }

    public enum TranscribeMode: String, Sendable { case target, en }

    /// POST /v1/transcribe: the recording (m4a) to text. Empty when nothing was understood.
    public func transcribe(audio: Data, filename: String = "speech.m4a", mimeType: String = "audio/mp4", mode: TranscribeMode = .target) async throws -> String {
        let boundary = "fuori-\(UUID().uuidString)"
        var body = Data()
        func field(_ name: String, _ value: String) {
            body.append(Data("--\(boundary)\r\nContent-Disposition: form-data; name=\"\(name)\"\r\n\r\n\(value)\r\n".utf8))
        }
        field("mode", mode.rawValue)
        body.append(Data("--\(boundary)\r\nContent-Disposition: form-data; name=\"audio\"; filename=\"\(filename)\"\r\nContent-Type: \(mimeType)\r\n\r\n".utf8))
        body.append(audio)
        body.append(Data("\r\n--\(boundary)--\r\n".utf8))
        var req = request("v1/transcribe")
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        req.httpBody = body
        struct Result: Decodable { let text: String }
        let result: Result = try await send(req, signedIn: true)
        return result.text.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// POST /v1/speak: the character's line in their voice, as MP3. Any error
    /// means "use the phone's own voice".
    public func speak(text: String, characterId: String, speed: Double) async throws -> Data {
        struct Body: Encodable { let text: String; let characterId: String; let speed: Double }
        return try await sendData(post("v1/speak", json: Body(text: text, characterId: characterId, speed: speed)), signedIn: true)
    }

    /// POST /v1/conversations/{id}/end: the character writes what they remember.
    /// Throws when saving failed, so the caller can keep it and retry.
    @discardableResult
    public func endConversation(_ id: String) async throws -> String {
        struct Result: Decodable { let remembered: String }
        let result: Result = try await send(post("v1/conversations/\(id)/end", json: [String: String]()), signedIn: true)
        return result.remembered
    }

    // MARK: - Errors

    /// An error the app hit, for the server log
    public struct ErrorReport: Encodable, Sendable {
        public let id: String
        public let step: String
        public let code: String?
        public let status: Int?
        public let message: String
        public let appVersion: String?
        public let os: String
        public let context: [String: String]?

        public init(id: String, step: String, error: Error, context: [String: String]? = nil) {
            let api = error as? APIError
            self.id = id
            self.step = step
            self.code = api?.code.rawValue
            self.status = api.map(\.status)
            self.message = String((api?.message ?? String(describing: error)).prefix(2000))
            let info = Bundle.main.infoDictionary
            self.appVersion = (info?["CFBundleShortVersionString"] as? String).map { "\($0) (\(info?["CFBundleVersion"] as? String ?? "?"))" }
            self.os = ProcessInfo.processInfo.operatingSystemVersionString
            self.context = context
        }
    }

    /// POST /v1/log: send an error to the server log. Never throws; signs the
    /// report when a token exists, but never signs in for it (signing in may be
    /// what failed).
    public func report(_ report: ErrorReport) async {
        do {
            var req = try post("v1/log", json: report)
            if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
            _ = try await session.data(for: req)
        } catch {
            print("Fuori: couldn't report \(report.id): \(error)")
        }
    }

    // MARK: - Plumbing

    private func post<B: Encodable>(_ path: String, json: B) throws -> URLRequest {
        var req = request(path)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(json)
        return req
    }

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

    private func request(_ path: String, timeout: TimeInterval? = nil) -> URLRequest {
        var req = URLRequest(url: baseURL.appending(path: path))
        if let timeout { req.timeoutInterval = timeout }
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        // Lets the server turn away builds that are too old (426, lib/app-version.ts)
        if let version = Self.appVersion { req.setValue(version, forHTTPHeaderField: "X-App-Version") }
        return req
    }

    /// The app's version (CFBundleShortVersionString); nil when not running in the app (tests)
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String

    private func send<T: Decodable>(_ request: URLRequest, signedIn: Bool) async throws -> T {
        try JSONDecoder().decode(T.self, from: try await sendData(request, signedIn: signedIn))
    }

    private func sendData(_ request: URLRequest, signedIn: Bool) async throws -> Data {
        var req = request
        if signedIn { req.setValue("Bearer \(try await ensureToken())", forHTTPHeaderField: "Authorization") }
        // The code the learner sees if this fails; the server logs it too
        let requestId = ErrorCode.make()
        req.setValue(requestId, forHTTPHeaderField: "x-fuori-id")
        let (data, response) = try await session.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else {
            var error = APIError.from(data: data, status: status)
            error.requestId = requestId
            // A revoked or unknown token: forget it, so the next call signs in again
            if error.code == .unauthorized { token = nil }
            throw error
        }
        return data
    }
}
