import Foundation
import Testing
@testable import FuoriNetworking

/// The address of a request with something after the "?" (GET /v1/level-up?conversationId=…). Written into the path,
/// the "?" was percent-encoded, the server answered 404 and the level up was never offered (docs/bugs.md B33).
@Suite struct RequestAddressTests {
    private let base = URL(string: "https://example.test")!

    @Test func queryIsNotPartOfThePath() {
        let url = APIClient.address(base, "v1/level-up", query: [URLQueryItem(name: "conversationId", value: "5279b94e-7389-4328-92f5-99a23224df4a")])
        #expect(url.path() == "/v1/level-up")
        #expect(url.query() == "conversationId=5279b94e-7389-4328-92f5-99a23224df4a")
        #expect(!url.absoluteString.contains("%3F"))
    }

    @Test func aPlainPathIsUnchanged() {
        #expect(APIClient.address(base, "v1/me").absoluteString == "https://example.test/v1/me")
    }

    /// What the old code did, kept so the reason for `query` stays visible: a "?" in the path is encoded
    @Test func aQuestionMarkInThePathIsEncoded() {
        #expect(APIClient.address(base, "v1/level-up?conversationId=x").absoluteString.contains("%3F"))
    }
}
