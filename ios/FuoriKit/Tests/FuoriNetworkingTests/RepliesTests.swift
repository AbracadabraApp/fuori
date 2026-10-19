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
}
