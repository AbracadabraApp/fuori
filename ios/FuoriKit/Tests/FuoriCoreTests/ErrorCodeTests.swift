import Testing
@testable import FuoriCore

/// Error codes look like the web's (E-XXXX, the server checks the shape) and
/// appear once in the message shown to the learner
@Suite struct ErrorCodeTests {
    @Test func looksLikeTheWebs() {
        for _ in 0..<200 {
            let code = ErrorCode.make()
            #expect(code.count == 6 && code.hasPrefix("E-"))
            #expect(code.dropFirst(2).allSatisfy { ErrorCode.alphabet.contains($0) })
        }
    }

    @Test func addsTheCodeOnce() {
        #expect(ErrorCode.message("Couldn't reach Fuori", code: "E-7K2F") == "Couldn't reach Fuori (E-7K2F)")
        #expect(ErrorCode.message("Something went wrong on the server (E-7K2F)", code: "E-7K2F") == "Something went wrong on the server (E-7K2F)")
    }
}
