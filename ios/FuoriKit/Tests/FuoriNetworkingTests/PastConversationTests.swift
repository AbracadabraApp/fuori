import Foundation
import Testing
@testable import FuoriNetworking

/// GET /v1/me/conversations (the Learn area) is read as the server writes it
@Suite struct PastConversationTests {
    @Test func readsTheList() throws {
        struct Body: Decodable { let conversations: [APIClient.PastConversation] }
        let json = Data(#"{"conversations":[{"id":"c1","cityId":"roma","placeId":"bar","characterId":"luisa","startedAt":"2026-10-26T10:00:00.000Z","lines":4}]}"#.utf8)
        let body = try JSONDecoder().decode(Body.self, from: json)
        #expect(body.conversations.first?.lines == 4)
        #expect(body.conversations.first?.placeId == "bar")
    }
}
