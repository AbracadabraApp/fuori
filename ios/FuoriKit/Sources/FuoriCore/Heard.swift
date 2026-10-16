import Foundation

/// Whether speech to text heard any words. Whisper can return only punctuation
/// for a cough or a noise ("...", "?"); that's nothing said, not a turn
/// (Josh's conversation, 2026-10-15: "..." was sent and answered). Checked by
/// character class, with no word lists, so it works in any language.
public enum Heard {
    public static func hasWords(_ text: String) -> Bool {
        text.contains(where: \.isLetter)
    }
}
