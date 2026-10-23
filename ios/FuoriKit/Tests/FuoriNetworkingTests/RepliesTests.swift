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

    /// The stage of a scaffolding turn (lib/scaffold.ts), and which reply fits
    /// on the choose stage; both absent from an older server
    @Test func readsStageAndFits() throws {
        let read = Data(#"{"line":"¿Se le lustran?","en":"Shine?","conversationId":"c","promptVersion":"v","replies":true,"stage":"read"}"#.utf8)
        let turn = try JSONDecoder().decode(APIClient.TurnReply.self, from: read)
        #expect(turn.stage == "read")
        let choice = Data(#"{"frame":"","replies":[{"line":"Sí","en":"Yes"},{"line":"Soy de Canadá","en":"I'm from Canada"}],"fits":0,"promptVersion":"v"}"#.utf8)
        #expect(try JSONDecoder().decode(APIClient.Replies.self, from: choice).fits == 0)
        let plain = Data(#"{"frame":"Sí","replies":[{"line":"Sí","en":"Yes"},{"line":"No","en":"No"}],"promptVersion":"v"}"#.utf8)
        #expect(try JSONDecoder().decode(APIClient.Replies.self, from: plain).fits == nil)
    }

    /// Say it in English (app/v1/say-it): the line to read and its English
    @Test func readsSayItLine() throws {
        let body = Data(#"{"line":"Vorrei un caffè.","en":"I'd like a coffee.","promptVersion":"v"}"#.utf8)
        let line = try JSONDecoder().decode(APIClient.SayItLine.self, from: body)
        #expect(line.line == "Vorrei un caffè." && line.en == "I'd like a coffee.")
    }
}
