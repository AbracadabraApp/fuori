import SwiftUI
import FuoriDesign

/// What the character just said, in a cream bubble on the left just above the
/// controls, growing upward like subtitles. Solid, not glass, so it stays
/// legible over the portrait (docs/13-ios-conventions.md R15) and reads as her
/// words, not a control: the reply buttons are glass on the right (Josh,
/// 2026-10-21, "Reply buttons" canvas D2/D3). Only her current line shows,
/// never a history and never a bubble for the learner (no transcript).
struct Subtitles: View {
    let line: String?
    /// Typewriter: characters of `line` spoken so far; nil when it's all out
    let shown: Int?
    let english: String?
    let note: String?
    // Web sizes, scaled with the learner's text size
    @ScaledMetric(relativeTo: .body) private var lineSize: CGFloat = 18
    @ScaledMetric(relativeTo: .callout) private var englishSize: CGFloat = 16

    var body: some View {
        VStack(spacing: 8) {
            if line != nil || english != nil {
                // The card hugs the text; only a long reply scrolls
                ViewThatFits(in: .vertical) {
                    text.fixedSize(horizontal: false, vertical: true)
                    ScrollView { text }.scrollBounceBehavior(.basedOnSize)
                }
                .frame(maxHeight: 260)
                .fixedSize(horizontal: false, vertical: true)
                .background(Tokens.Colors.paper, in: Self.bubble)
                .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
                // Hugs her words on the left, leaving the right for the learner's side
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.trailing, 40)
                // Room between her line and the replies or the mic
                .padding(.bottom, 10)
            }
            if let note {
                Text(note)
                    .typeface(.label, 15, relativeTo: .footnote)
                    .foregroundStyle(Tokens.Colors.muted)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    /// As on the web: the system sans at 18 pt, italic, line height 1.4; the
    /// English (16 pt, grey) only once the line has been spoken. The unspoken
    /// rest of the line is laid out but invisible, so the card takes its full
    /// size at once and doesn't grow as the text types out.
    private var text: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let line {
                Text(typed(line))
                    .font(.system(size: lineSize).italic())
                    .lineSpacing(lineSize * 0.4)
                    .foregroundStyle(Tokens.Colors.text)
                    .accessibilityLabel(String(line.prefix(shown ?? line.count)))
            }
            if let english, shown == nil {
                Text(english)
                    .font(.system(size: englishSize))
                    .lineSpacing(englishSize * 0.3)
                    .foregroundStyle(Tokens.Colors.muted)
            }
        }
        .padding(.vertical, 13)
        .padding(.horizontal, 16)
    }

    /// Rounded, with the top corner toward her portrait tightened
    private static let bubble = UnevenRoundedRectangle(
        topLeadingRadius: 6, bottomLeadingRadius: 20, bottomTrailingRadius: 20, topTrailingRadius: 20)

    private func typed(_ line: String) -> AttributedString {
        var text = AttributedString(line)
        guard let shown, shown < line.count else { return text }
        let start = text.index(text.startIndex, offsetByCharacters: shown)
        text[start...].foregroundColor = .clear
        return text
    }
}
