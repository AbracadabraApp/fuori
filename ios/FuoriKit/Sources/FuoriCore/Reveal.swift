import Foundation

/// Typewriter subtitles, ported from the web (lib/speech/reveal.ts): the line
/// appears as it's spoken, so the learner listens instead of reading ahead
/// (Josh, 2026-10-11). Pacing follows overall progress through the speech.
public enum Reveal {
    /// How many characters of `text` to show at `fraction` (0...1) of the
    /// speech. Never splits a word.
    public static func count(_ text: String, fraction: Double) -> Int {
        guard fraction > 0 else { return 0 }
        guard fraction < 1 else { return text.count }
        let chars = Array(text)
        var n = Int(Double(chars.count) * fraction)
        // Finish the word being typed rather than show half of it
        while n < chars.count, !chars[n].isWhitespace { n += 1 }
        return n
    }
}
