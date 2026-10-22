import Foundation
import Testing
@testable import FuoriNetworking

/// The lines of a streamed POST /v1/turn (app/v1/turn/route.ts), read as the
/// server writes them: the first sentence, then the reply or an error. A
/// server that doesn't stream sends the reply itself.
@Suite struct TurnStreamTests {
    @Test func readsFirstSentence() throws {
        #expect(try APIClient.TurnStreamEvent.parse(#"{"first":"Hola, ¿cómo está? "}"#) == .first("Hola, ¿cómo está? "))
    }

    @Test func readsReply() throws {
        let event = try APIClient.TurnStreamEvent.parse(#"{"reply":{"line":"Hola, ¿cómo está? Muy bien.","en":"Hi, how are you? Very well.","conversationId":"c","promptVersion":"v","replies":false,"stage":null}}"#)
        guard case .reply(let reply) = event else { Issue.record("not a reply: \(String(describing: event))"); return }
        #expect(reply.line == "Hola, ¿cómo está? Muy bien.")
        #expect(reply.conversationId == "c")
        #expect(reply.replies == false)
    }

    @Test func readsError() throws {
        let event = try APIClient.TurnStreamEvent.parse(#"{"error":{"code":"upstream_unavailable","message":"Claude is busy or unavailable","retryable":true,"retryAfterMs":2000},"status":503}"#)
        guard case .error(let error) = event else { Issue.record("not an error: \(String(describing: event))"); return }
        #expect(error.code == .upstreamUnavailable)
        #expect(error.status == 503)
        #expect(error.retryAfterMs == 2000)
    }

    /// An older server answers with the reply body, not a stream
    @Test func readsUnstreamedReply() throws {
        let event = try APIClient.TurnStreamEvent.parse(#"{"line":"Hola.","en":"Hi.","conversationId":"c","promptVersion":"v"}"#)
        guard case .reply(let reply) = event else { Issue.record("not a reply: \(String(describing: event))"); return }
        #expect(reply.line == "Hola.")
    }

    @Test func skipsBlankAndUnknownLines() throws {
        #expect(try APIClient.TurnStreamEvent.parse("") == nil)
        #expect(try APIClient.TurnStreamEvent.parse(#"{"later":"something new"}"#) == nil)
    }
}
