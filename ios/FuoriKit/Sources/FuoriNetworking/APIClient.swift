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
        /// beginner, intermediate or advanced; nil until the greeter has placed them
        public let level: String?
        /// false: show onboarding. nil from servers before 2026-10-17 (no onboarding)
        public let onboarded: Bool?
        /// Whether the server saves how characters address the learner
        /// (LEARNER_ADDRESS); nil from servers before 2026-10-22, meaning off
        public let addressOn: Bool?
        /// "f" or "m" once they've chosen; nil until then
        public let addressedAs: String?
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
        /// The learner's next turn uses two reply buttons (/v1/replies)
        /// instead of the mic: new learners, first turns of their first
        /// conversations. Nil from a server older than that
        public let replies: Bool?
        /// How the buttons are used (lib/scaffold.ts): "tap", "read" (tap,
        /// then read it aloud) or "choose" (only one fits; choose, then read
        /// it aloud). Nil when `replies` isn't true, or from an older server
        public let stage: String?
    }

    /// POST /v1/turn. Without a conversation id: the character's opening line.
    /// With one: the learner's line and the reply. The server works out the
    /// character from the ids and keeps the transcript.
    /// `speed`: what the app will ask /v1/speak for, so the server can start
    /// the voice at that speed as soon as the line is written
    public func turn(cityId: String, placeId: String, tripTo: String? = nil, conversationId: String? = nil, learnerSaid: String? = nil, speed: Double? = nil) async throws -> TurnReply {
        struct Body: Encodable { let cityId: String; let placeId: String; let tripTo: String?; let conversationId: String?; let learnerSaid: String?; let speed: Double? }
        return try await send(post("v1/turn", json: Body(cityId: cityId, placeId: placeId, tripTo: tripTo, conversationId: conversationId, learnerSaid: learnerSaid, speed: speed)), signedIn: true)
    }

    /// POST /v1/turn, streamed: `onFirst` gets the line's first sentence as
    /// soon as it's written (exactly as the line starts; its voice is already
    /// being made), while the rest is still being written; then the whole
    /// reply comes back as from `turn`. A line of one sentence, or a server
    /// that doesn't stream, gives no `onFirst`.
    public func turnStreamed(cityId: String, placeId: String, conversationId: String? = nil, learnerSaid: String? = nil, speed: Double? = nil, onFirst: @escaping @Sendable (String) -> Void) async throws -> TurnReply {
        struct Body: Encodable { let cityId: String; let placeId: String; let conversationId: String?; let learnerSaid: String?; let speed: Double? }
        var req = try post("v1/turn", json: Body(cityId: cityId, placeId: placeId, conversationId: conversationId, learnerSaid: learnerSaid, speed: speed))
        req.setValue("application/x-ndjson", forHTTPHeaderField: "Accept")
        req.setValue("Bearer \(try await ensureToken())", forHTTPHeaderField: "Authorization")
        let requestId = ErrorCode.make()
        req.setValue(requestId, forHTTPHeaderField: "x-fuori-id")
        let (bytes, response) = try await session.bytes(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else {
            var data = Data()
            for try await byte in bytes { data.append(byte) }
            var error = APIError.from(data: data, status: status)
            error.requestId = requestId
            if error.code == .unauthorized { token = nil }
            throw error
        }
        for try await line in bytes.lines {
            switch try TurnStreamEvent.parse(line) {
            case .first(let first): onFirst(first)
            case .reply(let reply): return reply
            case .error(var error):
                error.requestId = requestId
                throw error
            case nil: continue
            }
        }
        var error = APIError(code: .serverError, message: "The reply stopped before it finished", retryable: true, status: status)
        error.requestId = requestId
        throw error
    }

    /// One line of a streamed /v1/turn
    public enum TurnStreamEvent: Equatable, Sendable {
        case first(String)
        case reply(TurnReply)
        case error(APIError)

        /// nil for a blank line or one this build doesn't know. A server that
        /// doesn't stream answers with the reply itself, read as `.reply`.
        public static func parse(_ line: String) throws -> TurnStreamEvent? {
            let data = Data(line.utf8)
            guard !line.trimmingCharacters(in: .whitespaces).isEmpty else { return nil }
            struct Event: Decodable { let first: String?; let reply: TurnReply?; let error: APIError?; let status: Int? }
            let event = try JSONDecoder().decode(Event.self, from: data)
            if let first = event.first { return .first(first) }
            if let reply = event.reply { return .reply(reply) }
            if var error = event.error {
                error.status = event.status ?? 0
                return .error(error)
            }
            if let reply = try? JSONDecoder().decode(TurnReply.self, from: data) { return .reply(reply) }
            return nil
        }
    }

    /// One of the two reply buttons while scaffolding: a whole line in the
    /// language being learned, and its English
    public struct ReplyOption: Codable, Sendable, Equatable, Hashable {
        public let line: String
        public let en: String
    }

    public struct Replies: Codable, Sendable, Equatable {
        /// The chunk both replies are built on ("Vorrei…")
        public let frame: String
        public let replies: [ReplyOption]
        /// Choose stage: which reply fits (the other answers something else)
        public let fits: Int?
        public let promptVersion: String
    }

    /// POST /v1/replies: two replies to the character's last line, for the
    /// reply buttons (docs/beginner-scaffolding.md). The server reads the
    /// conversation; the character must have spoken last. `stage` "choose"
    /// writes one reply that fits and one that doesn't.
    public func replies(cityId: String, placeId: String, tripTo: String? = nil, conversationId: String, stage: String? = nil) async throws -> Replies {
        struct Body: Encodable { let cityId: String; let placeId: String; let tripTo: String?; let conversationId: String; let stage: String? }
        return try await send(post("v1/replies", json: Body(cityId: cityId, placeId: placeId, tripTo: tripTo, conversationId: conversationId, stage: stage)), signedIn: true)
    }

    /// The Learn page for a conversation so far (docs/learn.md → The page)
    public struct LearnPage: Codable, Sendable, Equatable {
        public struct Correction: Codable, Sendable, Equatable, Hashable {
            /// What the learner said (only the part that changes)
            public let said: String
            /// One plain line in English
            public let why: String
            /// The same part said right, in the language only; the character says it
            public let right: String
        }
        public struct Thing: Codable, Sendable, Equatable, Hashable {
            public let word: String
            public let en: String
            /// Empty unless the plural is what was said
            public let plural: String
        }
        public struct Doing: Codable, Sendable, Equatable, Hashable {
            public let infinitive: String
            public let en: String
            /// The form used in the conversation, empty when it's the infinitive
            public let form: String
        }
        public struct Words: Codable, Sendable, Equatable {
            public let things: [Thing]
            public let doing: [Doing]
        }
        public let corrections: [Correction]
        public let words: Words
        public let goodToKnow: String
        public let promptVersion: String
    }

    /// POST /v1/learn: the Learn page for this conversation so far. The server
    /// reads the conversation; the learner must have said something.
    public func learn(cityId: String, placeId: String, tripTo: String? = nil, conversationId: String) async throws -> LearnPage {
        struct Body: Encodable { let cityId: String; let placeId: String; let tripTo: String?; let conversationId: String }
        return try await send(post("v1/learn", json: Body(cityId: cityId, placeId: placeId, tripTo: tripTo, conversationId: conversationId)), signedIn: true)
    }

    /// target: the language being learned; en: English; any: Whisper detects
    /// it (onboarding answers can be either)
    /// target: the learned language; en: English; any: either, detected
    /// (onboarding); turn: a conversation turn, the learned language or
    /// English for say it in English (`language` is "en" or the learned code)
    public enum TranscribeMode: String, Sendable { case target, en, any, turn }

    /// What speech to text heard, and in which language (as Whisper names it)
    public struct Heard: Codable, Sendable, Equatable {
        public let text: String
        public let language: String?
        /// Mode "turn", heard as English: the same recording heard as the
        /// learned language (Whisper sometimes translates instead of
        /// transcribing). Nil otherwise, and from older servers
        public var learned: String? = nil

        /// Without the spaces Whisper leaves around the text, keeping every
        /// field (rebuilding it by hand once dropped `learned`, so say it never
        /// saw the learned-language version: 2026-10-24)
        func trimmed() -> Heard {
            Heard(text: text.trimmingCharacters(in: .whitespacesAndNewlines), language: language, learned: learned?.trimmingCharacters(in: .whitespacesAndNewlines))
        }
    }

    /// POST /v1/transcribe: the recording (m4a) to text. Empty when nothing was understood.
    public func transcribe(audio: Data, filename: String = "speech.m4a", mimeType: String = "audio/mp4", mode: TranscribeMode = .target) async throws -> String {
        try await transcribeHeard(audio: audio, filename: filename, mimeType: mimeType, mode: mode).text
    }

    /// POST /v1/transcribe, with the language it heard
    public func transcribeHeard(audio: Data, filename: String = "speech.m4a", mimeType: String = "audio/mp4", mode: TranscribeMode = .target) async throws -> Heard {
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
        let result: Heard = try await send(req, signedIn: true)
        return result.trimmed()
    }

    // MARK: - Onboarding (docs/onboarding-design.md)

    public struct OnboardingLine: Codable, Sendable, Equatable {
        public let line: String
        public let en: String
    }

    public struct SendOff: Codable, Sendable, Equatable {
        public let line: String
        public let en: String
        public let level: String
    }

    public struct HeardName: Codable, Sendable, Equatable {
        /// Just the name ("My name is Josh" → "Josh"); nil when none was given
        public let name: String?
    }

    /// Say it in English: the line in the language to read out loud, and its English
    public struct SayItLine: Codable, Sendable, Equatable {
        /// No line to read: it was already in the language (speech to text
        /// mislabels learners' speech as English) or too unclear to tell, so
        /// it goes to the character as said. Nil from a server before 2026-10-23c
        public let sendAsSaid: Bool?
        public let line: String
        public let en: String
    }

    /// POST /v1/say-it: what the learner said in English on their turn → the
    /// one line in the language they read out loud, at their level
    public func sayIt(cityId: String, placeId: String, tripTo: String? = nil, conversationId: String?, heard: String, heardAsLearned: String? = nil) async throws -> SayItLine {
        struct Body: Encodable { let cityId: String; let placeId: String; let tripTo: String?; let conversationId: String?; let heard: String; let heardAsLearned: String? }
        return try await send(post("v1/say-it", json: Body(cityId: cityId, placeId: placeId, tripTo: tripTo, conversationId: conversationId, heard: heard, heardAsLearned: heardAsLearned)), signedIn: true)
    }

    /// POST /v1/onboarding/name: the name out of what speech to text heard
    public func onboardingName(heard: String) async throws -> HeardName {
        struct Body: Encodable { let heard: String }
        return try await send(post("v1/onboarding/name", json: Body(heard: heard)), signedIn: true)
    }

    /// POST /v1/onboarding/follow-up: her reaction to the first answer and one harder question
    public func onboardingFollowUp(answer: Heard) async throws -> OnboardingLine {
        struct Body: Encodable { let answer: Heard }
        return try await send(post("v1/onboarding/follow-up", json: Body(answer: answer)), signedIn: true)
    }

    /// POST /v1/onboarding/send-off: her send-off and the learner's level (stored by the server)
    public func onboardingSendOff(answers: [Heard]) async throws -> SendOff {
        struct Body: Encodable { let answers: [Heard] }
        return try await send(post("v1/onboarding/send-off", json: Body(answers: answers)), signedIn: true)
    }

    /// POST /v1/onboarding/done: the beginner path, no Claude call
    /// POST /v1/onboarding/level: the level they picked in the orientation
    /// tour; onboarding is done
    public func onboardingLevel(_ level: String) async throws {
        struct Body: Encodable { let level: String }
        _ = try await sendData(post("v1/onboarding/level", json: Body(level: level)), signedIn: true)
    }

    /// POST /v1/me/level: Settings, their level (beginner, intermediate, advanced)
    public func chooseLevel(_ level: String) async throws {
        struct Body: Encodable { let level: String }
        _ = try await sendData(post("v1/me/level", json: Body(level: level)), signedIn: true)
    }

    public func onboardingDone() async throws {
        struct Body: Encodable { let path = "beginner" }
        _ = try await sendData(post("v1/onboarding/done", json: Body()), signedIn: true)
    }

    /// POST /v1/onboarding/address: how every character addresses them ("f" or
    /// "m"), and the name for her. 404 while the server has it off
    public func onboardingAddress(addressedAs: String, name: String?) async throws {
        struct Body: Encodable { let addressedAs: String; let name: String? }
        _ = try await sendData(post("v1/onboarding/address", json: Body(addressedAs: addressedAs, name: name)), signedIn: true)
    }

    /// POST /v1/onboarding/reset: Restart onboarding (the greeter welcomes them again)
    public func onboardingReset() async throws {
        _ = try await sendData(post("v1/onboarding/reset", json: [String: String]()), signedIn: true)
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

    /// POST /v1/me/start-over: Restart Fuori. The server makes a new player
    /// for this device; its token replaces the old one only once it's here,
    /// so a failure leaves the learner as they were
    public func startOver() async throws -> String {
        let device: Device = try await send(post("v1/me/start-over", json: [String: String]()), signedIn: true)
        tokens.save(device.token)
        token = device.token
        return device.learnerId
    }

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
