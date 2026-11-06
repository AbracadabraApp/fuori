import SwiftUI
import FuoriDesign

/// A place's menu or board (Osteria da Nino's dishes, the Sorbetteria's
/// flavours), at the top of the picture while you talk (Josh, 2026-11-06:
/// "very readable text over the place picture"; 2026-11-05: "just a legible
/// menu … nothing else"). Ink on solid paper, so it reads over any picture;
/// one line a dish, sized by Dynamic Type; read by VoiceOver in the language.
/// Nothing to tap: you order by talking.
struct MenuBoard: View {
    let items: [String]
    let speechLanguage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(items, id: \.self) { item in
                Text(tagged(item))
                    .typeface(.display, 20, relativeTo: .title3, weight: .semibold)
                    .foregroundStyle(Tokens.Colors.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 14)
        .padding(.horizontal, 16)
        .background(Tokens.Colors.paper, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Tokens.Colors.herEdge, lineWidth: 1))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Menu")
    }

    private func tagged(_ item: String) -> AttributedString {
        var s = AttributedString(item)
        s.languageIdentifier = speechLanguage
        return s
    }
}
