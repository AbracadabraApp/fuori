import Foundation
import Testing
@testable import FuoriNetworking

/// POST /v1/say-it's answer (lib/say-it.ts): a line to read, or none when the
/// turn goes to the character as said (2026-10-23c); older servers don't say
@Suite struct SayItTests {
    @Test func readsALine() throws {
        let line = try JSONDecoder().decode(APIClient.SayItLine.self, from: Data(#"{"sendAsSaid":false,"line":"Hola, gracias.","en":"Hi, thanks.","promptVersion":"v"}"#.utf8))
        #expect(line.sendAsSaid == false)
        #expect(line.line == "Hola, gracias.")
    }

    @Test func readsSendAsSaid() throws {
        let line = try JSONDecoder().decode(APIClient.SayItLine.self, from: Data(#"{"sendAsSaid":true,"line":"","en":"","promptVersion":"v"}"#.utf8))
        #expect(line.sendAsSaid == true)
        #expect(line.line.isEmpty)
    }

    @Test func readsAnOlderServer() throws {
        let line = try JSONDecoder().decode(APIClient.SayItLine.self, from: Data(#"{"line":"Hola.","en":"Hi.","promptVersion":"v"}"#.utf8))
        #expect(line.sendAsSaid == nil)
    }

    /// /v1/transcribe in turn mode, heard as English: the same recording heard
    /// as the learned language comes along (Whisper can translate)
    @Test func readsHeardAsLearned() throws {
        let both = try JSONDecoder().decode(APIClient.Heard.self, from: Data(#"{"text":"I would like a cone.","language":"en","learned":"Vorrei un cono."}"#.utf8))
        #expect(both.learned == "Vorrei un cono.")
        let plain = try JSONDecoder().decode(APIClient.Heard.self, from: Data(#"{"text":"Vorrei un cono.","language":"xx"}"#.utf8))
        #expect(plain.learned == nil)
    }

    /// transcribeHeard trims what it decoded: the learned-language version must
    /// survive that, or say it never sees it (found from a Venice turn that
    /// became a line to read, Josh, 2026-10-24)
    @Test func trimmingKeepsHeardAsLearned() throws {
        let heard = try JSONDecoder().decode(APIClient.Heard.self, from: Data(#"{"text":" My accent is obvious, yes? ","language":"en","learned":" Si sente il mio accento, vero? "}"#.utf8)).trimmed()
        #expect(heard.text == "My accent is obvious, yes?")
        #expect(heard.language == "en")
        #expect(heard.learned == "Si sente il mio accento, vero?")
    }
}
