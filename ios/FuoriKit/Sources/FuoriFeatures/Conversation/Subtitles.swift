import SwiftUI
import FuoriDesign

/// What the character just said, on a white card just above the controls,
/// growing upward like subtitles (the web's reply card). Solid, not glass, so
/// it stays legible over the portrait (docs/13-ios-conventions.md R15).
struct Subtitles: View {
    let line: String?
    let english: String?
    let note: String?

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
                .background(Tokens.Colors.card.opacity(0.96), in: RoundedRectangle(cornerRadius: 14))
                .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
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

    private var text: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let line {
                Text(line)
                    .typeface(.label, 18, relativeTo: .body)
                    .italic()
                    .foregroundStyle(Tokens.Colors.text)
            }
            if let english {
                Text(english)
                    .typeface(.label, 16, relativeTo: .callout)
                    .foregroundStyle(Tokens.Colors.muted)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 14)
        .padding(.horizontal, 16)
    }
}
