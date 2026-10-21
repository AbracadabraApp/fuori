import Foundation
import Testing
@testable import FuoriNetworking

/// The reply buttons' response from POST /v1/replies (app/v1/replies/route.ts)
/// is read as the server writes it, so the buttons never fall back to the mic
/// because of a shape mismatch.
@Suite struct RepliesTests {
    @Test func readsServerReplies() throws {
        let body = Data(#"{"frame":"Compramos…","replies":[{"line":"Compramos mangos y plátanos.","en":"We buy mangoes and bananas."},{"line":"Compramos pan y queso.","en":"We buy bread and cheese."}],"promptVersion":"2026-10-18"}"#.utf8)
        let replies = try JSONDecoder().decode(APIClient.Replies.self, from: body)
        #expect(replies.frame == "Compramos…")
        #expect(replies.replies.count == 2)
        #expect(replies.replies[1].line == "Compramos pan y queso.")
        #expect(replies.replies[0].en == "We buy mangoes and bananas.")
    }

    /// /v1/turn says whether the next turn is a tap (lib/scaffold.ts); an
    /// older server leaves it out, which means the mic
    @Test func readsTurnRepliesFlag() throws {
        let on = Data(#"{"line":"¿Se le lustran?","en":"Shine?","conversationId":"c","promptVersion":"v","replies":true}"#.utf8)
        let old = Data(#"{"line":"¿Se le lustran?","en":"Shine?","conversationId":"c","promptVersion":"v"}"#.utf8)
        #expect(try JSONDecoder().decode(APIClient.TurnReply.self, from: on).replies == true)
        #expect(try JSONDecoder().decode(APIClient.TurnReply.self, from: old).replies == nil)
    }
}
