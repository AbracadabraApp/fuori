import Foundation
import Testing
@testable import FuoriNetworking

/// GET /v1/me (app/v1/me/route.ts): whether the server saves how characters
/// address the learner, and their choice. An older server leaves both out,
/// which means off: no question in onboarding, no Settings row.
@Suite struct MeTests {
    @Test func readsAddress() throws {
        let on = Data(#"{"learnerId":"l","country":"it","visits":{},"level":"beginner","onboarded":true,"addressOn":true,"addressedAs":"f"}"#.utf8)
        let notChosen = Data(#"{"learnerId":"l","country":"it","visits":{},"level":null,"onboarded":false,"addressOn":true}"#.utf8)
        let old = Data(#"{"learnerId":"l","country":"it","visits":{},"level":null,"onboarded":false}"#.utf8)
        let me = try JSONDecoder().decode(APIClient.Me.self, from: on)
        #expect(me.addressOn == true && me.addressedAs == "f")
        let fresh = try JSONDecoder().decode(APIClient.Me.self, from: notChosen)
        #expect(fresh.addressOn == true && fresh.addressedAs == nil)
        let older = try JSONDecoder().decode(APIClient.Me.self, from: old)
        #expect(older.addressOn == nil && older.addressedAs == nil)
    }
}
