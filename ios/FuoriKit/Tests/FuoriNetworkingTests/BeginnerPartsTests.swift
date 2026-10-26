import Foundation
import Testing
@testable import FuoriNetworking

/// A Beginner turn from /v1/turn (lib/beginner.ts): the parts come with the
/// usual line; other levels and older servers send none
@Suite struct BeginnerPartsTests {
    @Test func readsParts() throws {
        let body = Data(#"{"line":"Welcome! il pesce Le piace? Mi piace.","en":"Welcome! the fish Do you like it? I like it.","conversationId":"c","promptVersion":"beginner-v","replies":false,"stage":null,"parts":[{"kind":"english","text":"Welcome!","en":""},{"kind":"word","text":"il pesce","en":"the fish"},{"kind":"question","text":"Le piace?","en":"Do you like it?"},{"kind":"answer","text":"Mi piace.","en":"I like it."}]}"#.utf8)
        let reply = try JSONDecoder().decode(APIClient.TurnReply.self, from: body)
        #expect(reply.parts?.count == 4)
        #expect(reply.parts?[0].isEnglish == true)
        #expect(reply.parts?[3].isAnswer == true)
        #expect(reply.parts?[2].en == "Do you like it?")
    }

    @Test func noPartsForOtherLevels() throws {
        let body = Data(#"{"line":"Ciao!","en":"Hi!","conversationId":"c","promptVersion":"v"}"#.utf8)
        #expect(try JSONDecoder().decode(APIClient.TurnReply.self, from: body).parts == nil)
    }
}
