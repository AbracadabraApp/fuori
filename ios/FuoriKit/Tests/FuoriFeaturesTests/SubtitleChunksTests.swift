import Foundation
import Testing
@testable import FuoriFeatures

/// The intro's English in pieces of at most two lines (Josh, 2026-11-12). Raymundo's sentence ran to five lines and
/// was cut off with "…" while the voice went on; every word must still show, in order, as the voice moves through it
struct SubtitleChunksTests {
    /// Each character 10 pt wide: a 300 pt line holds 30 characters
    private let width: (String) -> CGFloat = { CGFloat($0.count) * 10 }
    private let raymundo = "Right now I'm going down through the vault, with the lights on even in daytime, and at each exit the bus comes out on a different street."

    @Test func aLongSentenceSplitsIntoPiecesOfTwoLinesWithEveryWordKept() {
        let chunks = SubtitleChunks.split(raymundo, maxWidth: 300, width: width)
        #expect(chunks.count > 1)
        #expect(chunks.joined(separator: " ") == raymundo)
        // No piece runs past two 300 pt lines (two lines hold at most 61 characters with the space between)
        #expect(chunks.allSatisfy { $0.count <= 61 })
    }

    @Test func aShortSentenceStaysWhole() {
        #expect(SubtitleChunks.split("Would you like a coffee?", maxWidth: 300, width: width) == ["Would you like a coffee?"])
    }

    @Test func beforeTheBandIsMeasuredTheSentenceShowsWhole() {
        #expect(SubtitleChunks.split(raymundo, maxWidth: 0, width: width) == [raymundo])
    }

    @Test func thePieceFollowsTheVoice() {
        let chunks = SubtitleChunks.split(raymundo, maxWidth: 300, width: width)
        #expect(SubtitleChunks.index(chunks, progress: 0) == 0)
        #expect(SubtitleChunks.index(chunks, progress: 0.99) == chunks.count - 1)
        #expect(SubtitleChunks.index(chunks, progress: 1) == chunks.count - 1)
        // In order: never back to an earlier piece as the voice moves on
        let steps = stride(from: 0.0, through: 1.0, by: 0.05).map { SubtitleChunks.index(chunks, progress: $0) }
        #expect(steps == steps.sorted())
    }
}
