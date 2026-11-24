import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Learn 2.0's sheet after a visit's goodbye (docs/learn-sheet-2-design.md): one card, the card is the
/// sheet. The headline level with a small round close button, then one sage block of lines, each in
/// the language with its English under it; a line with no language is a plain English line, drawn in its
/// place (a saying's meaning, why a word matters). No picture, no Done, no audio, no mark for the kind
/// (design rule 12). The sheet is sized to the card: it reports its height to PersonView.
/// Every way out (the close button, sliding it down, a tap off it) ends on the place list: PersonView
/// dismisses itself when the sheet goes.
struct LearnCardSheet: View {
    let card: APIClient.LearnCard
    let speechLanguage: String
    /// The card's full height, for the sheet's one detent
    @Binding var height: CGFloat
    @Environment(\.dismiss) private var dismiss
    /// The drawings' close button, about 35 pt across on a 390 pt screen (Josh, 2026-11-24: "yes" to matching it; was 28)
    @ScaledMetric(relativeTo: .body) private var closeSize: CGFloat = 35
    // The drawn cards' type (design/learn-sheet-2/cards, Josh: "These look much better"): a plain sans at
    // their sizes. The drawings use Public Sans, which the app doesn't have; the system font is the nearest
    @ScaledMetric(relativeTo: .headline) private var headSize: CGFloat = 18
    @ScaledMetric(relativeTo: .subheadline) private var lineSize: CGFloat = 15
    @ScaledMetric(relativeTo: .footnote) private var enSize: CGFloat = 13
    @ScaledMetric(relativeTo: .subheadline) private var plainSize: CGFloat = 14

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .center, spacing: 12) {
                    Text(headline)
                        .font(.system(size: headSize, weight: .medium))
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
                VStack(alignment: .leading, spacing: 9) {
                    ForEach(Array(card.rows.enumerated()), id: \.offset) { _, row in
                        if row.text.isEmpty {
                            // A plain English line, in its place among the lines
                            Text(row.en)
                                .font(.system(size: plainSize))
                                .foregroundStyle(Tokens.Colors.text)
                                .fixedSize(horizontal: false, vertical: true)
                        } else {
                            VStack(alignment: .leading, spacing: 1) {
                                Text(tagged(row.text))
                                    .font(.system(size: lineSize, weight: .semibold))
                                    .foregroundStyle(Tokens.Colors.ink)
                                Text(row.en)
                                    .font(.system(size: enSize))
                                    .foregroundStyle(Tokens.Colors.muted)
                            }
                            .fixedSize(horizontal: false, vertical: true)
                            .accessibilityElement(children: .combine)
                        }
                    }
                    if let note = card.note, !note.isEmpty {
                        Text(note)
                            .font(.system(size: plainSize))
                            .foregroundStyle(Tokens.Colors.text)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 12)
                .padding(.vertical, 11)
                .background(Tokens.Colors.learnCard, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            .padding(.horizontal, Tokens.Space.gutter)
            .padding(.top, 18)
            // The sheet adds the home bar's room under this; the drawn cards sit close to the bottom
            .padding(.bottom, 2)
            .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { height = $0 }
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
