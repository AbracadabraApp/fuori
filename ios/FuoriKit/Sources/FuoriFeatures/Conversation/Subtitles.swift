import SwiftUI
import FuoriDesign

/// What the character just said, in her bubble on the left just above the
/// controls (SpeechBubble: the same at every level; docs/dialogue-model.md →
/// Who is talking), growing upward like subtitles. Only her current line
/// shows, never a history and never a bubble for what the learner said (no
/// transcript).
struct Subtitles: View {
    let line: String?
    /// Typewriter: characters of `line` spoken so far; nil when it's all out
    let shown: Int?
    let english: String?
    let note: String?
    /// The Beginner hint under the character's first line ("Answer in Italian or English")
    var hint: String? = nil
    /// The language's code, so VoiceOver reads the line in it, not in English
    var speechLanguage: String? = nil
    // Sizes from the tokens (design/tokens.json), scaled with the learner's text size
    @ScaledMetric(relativeTo: .body) private var lineSize: CGFloat = Tokens.Size.bubbleText
    @ScaledMetric(relativeTo: .footnote) private var hintSize: CGFloat = Tokens.Size.hint

    var body: some View {
        VStack(spacing: 8) {
            // Only once there are words to show: the English alone, waiting for the line to finish, drew an empty
            // oval while the character spoke (Josh's Mexico play, 2026-11-12)
            if let line, !line.isEmpty {
                // The same bubble as the answers (SpeechBubble, Josh 2026-11-11: "her bubble style should match the
                // other, font size, translation line"); only a long reply scrolls
                SpeechBubble(speaker: .her) {
                    ViewThatFits(in: .vertical) {
                        text.fixedSize(horizontal: false, vertical: true)
                        ScrollView { text }.scrollBounceBehavior(.basedOnSize)
                    }
                    .frame(maxHeight: 260)
                    .fixedSize(horizontal: false, vertical: true)
                }
                // Room between her line and the replies or the mic
                .padding(.bottom, 10)
            }
            if let note {
                Text(note)
                    .typeface(.label, Tokens.Size.note, relativeTo: .footnote)
                    .foregroundStyle(Tokens.Colors.muted)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    /// The system sans at 18 pt, as in every bubble; the English under it
    /// only once the line has been spoken. The unspoken
    /// rest of the line is laid out but invisible, so the card takes its full
    /// size at once and doesn't grow as the text types out.
    private var text: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let line {
                Text(typed(line))
                    .font(.system(size: lineSize))
                    .foregroundStyle(Tokens.Colors.ink)
                    .accessibilityLabel(Text(tagged(String(line.prefix(shown ?? line.count)))))
            }
            if let english, shown == nil {
                BubbleEnglish(text: english, speaker: .her)
            }
            if let hint, shown == nil {
                Divider()
                Label(hint, systemImage: "mic.fill")
                    .labelStyle(HintLabelStyle())
                    .font(.system(size: hintSize))
                    .foregroundStyle(Tokens.Colors.green)
            }
        }
    }

    /// Tagged with the language, so VoiceOver reads it in that language
    private func tagged(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        if let speechLanguage { s.languageIdentifier = speechLanguage }
        return s
    }

    private func typed(_ line: String) -> AttributedString {
        var text = tagged(line)
        guard let shown, shown < line.count else { return text }
        let start = text.index(text.startIndex, offsetByCharacters: shown)
        text[start...].foregroundColor = .clear
        return text
    }
}

/// A small icon beside the text, top-aligned when the text wraps
private struct HintLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            configuration.icon.imageScale(.small)
            configuration.title
        }
    }
}
