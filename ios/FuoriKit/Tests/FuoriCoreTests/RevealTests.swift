import Testing
@testable import FuoriCore

/// Same cases as the web's typewriter (lib/speech/reveal.ts, test:reveal)
@Suite struct RevealTests {
    let line = "Buongiorno, cosa ti preparo oggi?"

    @Test func nothingBeforeTheStartAndAllAtTheEnd() {
        #expect(Reveal.count(line, fraction: 0) == 0)
        #expect(Reveal.count(line, fraction: 1) == line.count)
        #expect(Reveal.count(line, fraction: 1.2) == line.count)
    }

    @Test func neverSplitsAWord() {
        for step in 1..<20 {
            let n = Reveal.count(line, fraction: Double(step) / 20)
            let shown = Array(line)
            #expect(n == shown.count || shown[n].isWhitespace, "split a word at \(n)")
        }
    }

    @Test func growsWithProgress() {
        #expect(Reveal.count(line, fraction: 0.3) <= Reveal.count(line, fraction: 0.6))
    }
}
