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
}
