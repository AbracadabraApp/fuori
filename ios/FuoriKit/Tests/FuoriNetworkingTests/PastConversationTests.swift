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

    /// GET /v1/learn/home: the Learn page's History and finished lessons, and
    /// a server from before them (only the mistake)
    @Test func readsLearnHome() throws {
        let now = Data(#"{"lesson":null,"history":{"cities":3,"people":14,"conversations":27},"lessonsDone":["a1-01-1"],"lessonSet":2}"#.utf8)
        let home = try JSONDecoder().decode(APIClient.LearnHome.self, from: now)
        #expect(home.history?.people == 14)
        #expect(home.lessonsDone == ["a1-01-1"])
        #expect(home.lessonSet == 2)
        let before = try JSONDecoder().decode(APIClient.LearnHome.self, from: Data(#"{"lesson":null}"#.utf8))
        #expect(before.history == nil)
        #expect(before.lessonsDone == nil)
        #expect(before.lessonSet == nil)
    }
}
