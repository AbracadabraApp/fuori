import Foundation
import Testing
@testable import FuoriNetworking

/// POST /v1/replies answers in this shape (app/v1/replies/route.ts); this body
/// is the live server's answer at Giulia's bar on 2026-10-18.
@Suite struct RepliesTests {
    @Test func readsLiveReplies() throws {
        let body = Data(#"{"frame":"Vorrei","replies":[{"line":"Vorrei un caffè, per favore.","en":"I would like a coffee, please."},{"line":"Vorrei un tè, per favore.","en":"I would like a tea, please."}],"promptVersion":"2026-10-17b"}"#.utf8)
        let replies = try JSONDecoder().decode(APIClient.Replies.self, from: body)
        #expect(replies.frame == "Vorrei")
        #expect(replies.replies.count == 2)
        #expect(replies.replies[1].line == "Vorrei un tè, per favore.")
        #expect(replies.replies[1].en == "I would like a tea, please.")
    }
}
