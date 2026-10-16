import Foundation

/// The server's one error shape for /v1 (lib/api.ts):
/// { "error": { "code", "message", "retryable", "retryAfterMs"? } }
public struct APIError: Error, Codable, Sendable, Equatable {
    public enum Code: String, Codable, Sendable {
        case badRequest = "bad_request"
        case unauthorized
        case notFound = "not_found"
        case rateLimited = "rate_limited"
        case quota
        case badAudio = "bad_audio"
        case upstreamUnavailable = "upstream_unavailable"
        case serverError = "server_error"
        /// A code this build doesn't know yet (the server adds codes; it never renames them)
        case unknown

        public init(from decoder: Decoder) throws {
            self = Code(rawValue: try decoder.singleValueContainer().decode(String.self)) ?? .unknown
        }
    }

    public let code: Code
    public let message: String
    public let retryable: Bool
    public let retryAfterMs: Int?
    /// HTTP status, filled in by the client
    public var status: Int = 0
    /// The request's code (x-fuori-id), filled in by the client
    public var requestId: String?

    enum CodingKeys: String, CodingKey { case code, message, retryable, retryAfterMs }

    public init(code: Code, message: String, retryable: Bool, retryAfterMs: Int? = nil, status: Int = 0) {
        self.code = code
        self.message = message
        self.retryable = retryable
        self.retryAfterMs = retryAfterMs
        self.status = status
    }

    /// Reads an error body; anything else (an HTML error page, no body) becomes a server_error
    public static func from(data: Data, status: Int) -> APIError {
        struct Envelope: Decodable { let error: APIError }
        var error = (try? JSONDecoder().decode(Envelope.self, from: data))?.error
            ?? APIError(code: .serverError, message: "HTTP \(status)", retryable: status >= 500)
        error.status = status
        return error
    }
}
