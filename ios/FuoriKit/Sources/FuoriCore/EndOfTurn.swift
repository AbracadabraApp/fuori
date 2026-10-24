import Foundation

/// How long a silence ends the learner's turn, from what speech to text has
/// heard so far (2026-10-23, speed): punctuation only, so any language. A
/// finished sentence ("Vorrei un caffè, per favore.") ends sooner; one that
/// trails off ("Vorrei un…", "e", a comma) gets longer to find the word.
/// Tested on Whisper with synthetic clips: 31 of 32 told apart, Italian and
/// Spanish, native and English-accented voices.
public enum EndOfTurn {
    /// Before anything's been heard, or when it can't tell (Josh, 2026-10-23: 2.5 s, not 2)
    public static let usual: TimeInterval = 2.5
    public static let finished: TimeInterval = 1.2
    public static let trailing: TimeInterval = 3.5

    public static func silence(after heard: String) -> TimeInterval {
        let t = heard.trimmingCharacters(in: .whitespacesAndNewlines)
            .trimmingCharacters(in: CharacterSet(charactersIn: "\"'»”’)]"))
        guard !t.isEmpty else { return usual }
        if t.hasSuffix("...") || t.hasSuffix("…") || t.hasSuffix(",") || t.hasSuffix("-") { return trailing }
        if let last = t.last, ".!?".contains(last) { return finished }
        // No mark at the end: Whisper leaves it off when speech stops mid-sentence
        return trailing
    }
}
