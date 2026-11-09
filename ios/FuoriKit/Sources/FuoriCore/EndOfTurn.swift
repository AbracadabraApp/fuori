import Foundation

/// How long a silence ends the learner's turn, from what speech to text has
/// heard so far (2026-10-23, speed): punctuation only, so any language. A
/// finished sentence ("Vorrei un caffè, per favore.") ends sooner; one that
/// trails off ("Vorrei un…", "e", a comma) gets longer to find the word.
/// Tested on Whisper with synthetic clips: 31 of 32 told apart, Italian and
/// Spanish, native and English-accented voices.
///
/// Intermediate and Advanced get shorter waits (N6 item 5; Beginners keep
/// 2.5 s, Josh 2026-10-23): someone who speaks the language pauses less to
/// find a word, and every tenth of a second is on the way to her reply. The
/// kept recordings (2026-11-02) hold only two conversation turns, too few to
/// tune from, so the numbers are about four fifths of the Beginner's, to adjust
/// from play.
public enum EndOfTurn {
    /// Before anything's been heard, or when it can't tell (Josh, 2026-10-23: 2.5 s, not 2)
    public static let usual: TimeInterval = 2.5
    public static let finished: TimeInterval = 1.2
    public static let trailing: TimeInterval = 3.5

    /// The three waits for a level
    public struct Waits: Sendable, Equatable {
        public let usual: TimeInterval
        public let finished: TimeInterval
        public let trailing: TimeInterval
    }
    /// A Beginner, or a learner with no level yet
    public static let beginner = Waits(usual: usual, finished: finished, trailing: trailing)
    /// Intermediate and Advanced
    public static let speaking = Waits(usual: 2.0, finished: 0.9, trailing: 2.8)

    public static func waits(beginner: Bool) -> Waits { beginner ? Self.beginner : speaking }

    public static func silence(after heard: String, waits: Waits = beginner) -> TimeInterval {
        let t = heard.trimmingCharacters(in: .whitespacesAndNewlines)
            .trimmingCharacters(in: CharacterSet(charactersIn: "\"'»”’)]"))
        guard !t.isEmpty else { return waits.usual }
        if t.hasSuffix("...") || t.hasSuffix("…") || t.hasSuffix(",") || t.hasSuffix("-") { return waits.trailing }
        if let last = t.last, ".!?".contains(last) { return waits.finished }
        // No mark at the end: Whisper leaves it off when speech stops mid-sentence
        return waits.trailing
    }
}
