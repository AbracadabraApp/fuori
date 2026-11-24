import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Learn 2.0's sheet after a visit's goodbye (docs/learn-sheet-2-design.md): one card, the card is the
/// sheet. The headline level with a small round close button, then one sage block of lines, each in
/// the language with its English under it, and an optional plain line. No picture, no Done, no audio.
/// Every way out (the close button, sliding it down, a tap off it) ends on the place list: PersonView
/// dismisses itself when the sheet goes.
struct LearnCardSheet: View {
    let card: APIClient.LearnCard
    let speechLanguage: String
    @Environment(\.dismiss) private var dismiss
    @ScaledMetric(relativeTo: .body) private var closeSize: CGFloat = 30

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .firstTextBaseline, spacing: 12) {
                    Text(headline)
                        .typeface(.label, 19, relativeTo: .title3, weight: .semibold)
                        .foregroundStyle(Tokens.Colors.ink)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityAddTraits(.isHeader)
                    Spacer(minLength: 0)
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: closeSize * 0.42, weight: .semibold))
                            .foregroundStyle(Tokens.Colors.text)
                            .frame(width: closeSize, height: closeSize)
                            .background(Tokens.Colors.learnCard, in: Circle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Close")
                }
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(Array(card.rows.enumerated()), id: \.offset) { _, row in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(tagged(row.text))
                                .typeface(.label, 17, relativeTo: .body, weight: .semibold)
                                .foregroundStyle(Tokens.Colors.ink)
                            Text(row.en)
                                .typeface(.label, 15, relativeTo: .subheadline)
                                .foregroundStyle(Tokens.Colors.muted)
                        }
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityElement(children: .combine)
                    }
                    if let note = card.note, !note.isEmpty {
                        Text(note)
                            .typeface(.label, 16, relativeTo: .body)
                            .foregroundStyle(Tokens.Colors.text)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background(Tokens.Colors.learnCard, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .padding(.horizontal, Tokens.Space.gutter)
            .padding(.top, 20)
            .padding(.bottom, 12)
        }
        .scrollBounceBehavior(.basedOnSize)
        .background(Tokens.Colors.card)
    }

    /// The headline, with the word in the language that finishes it tagged as that language
    private var headline: AttributedString {
        var all = AttributedString(card.headline)
        if let term = card.term, !term.isEmpty {
            all += AttributedString(": ")
            all += tagged(term)
        }
        return all
    }

    /// Text in the learned language, tagged so VoiceOver reads it in that language
    private func tagged(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = speechLanguage
        return s
    }
}
