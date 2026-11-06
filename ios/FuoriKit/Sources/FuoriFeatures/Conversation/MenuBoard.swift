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
    /// The word over it, in the language ("Menu"); none from older servers
    let title: String?
    let speechLanguage: String

    @Environment(\.dynamicTypeSize) private var typeSize

    var body: some View {
        // Two columns so the card stays short and the face shows (Josh,
        // 2026-11-06); one column at accessibility sizes, never cutting a name
        let columns = typeSize.isAccessibilitySize ? 1 : 2
        VStack(alignment: .leading, spacing: 6) {
        if let title {
            Text(tagged(title))
                .typeface(.display, 15, relativeTo: .subheadline, weight: .bold)
                .textCase(.uppercase)
                .kerning(1)
                .foregroundStyle(Tokens.Colors.muted)
                .accessibilityAddTraits(.isHeader)
        }
        Grid(alignment: .leading, horizontalSpacing: 20, verticalSpacing: 6) {
            ForEach(Array(stride(from: 0, to: items.count, by: columns)), id: \.self) { row in
                GridRow {
                    ForEach(row..<min(row + columns, items.count), id: \.self) { i in
                        Text(tagged(items[i]))
                            .typeface(.display, 20, relativeTo: .title3, weight: .semibold)
                            .foregroundStyle(Tokens.Colors.ink)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
        .background(Tokens.Colors.paper, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Tokens.Colors.herEdge, lineWidth: 1))
        // As wide as its names, on the left
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
    }

    private func tagged(_ item: String) -> AttributedString {
        var s = AttributedString(item)
        s.languageIdentifier = speechLanguage
        return s
    }
}
