import SwiftUI
import FuoriCore
import FuoriDesign

/// First launch: pick the country you're living in (docs/onboarding-design.md
/// → Ship first). Two picture cards, each from that country's /v1/content;
/// tapping one goes straight to its city list until the rest of onboarding
/// exists. Shown once; switching later is in Settings.
struct CountryChoiceView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Tokens.Space.cardGap) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Where are you headed?")
                        .typeface(.display, Tokens.Size.personName, relativeTo: .largeTitle, weight: .bold)
                        .foregroundStyle(Tokens.Colors.ink)
                        .accessibilityAddTraits(.isHeader)
                    Text("Pick the country you're living in. You can switch any time in Settings.")
                        .typeface(.label, Tokens.Size.body, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.muted)
                }
                ForEach(model.countries) { country in
                    Button { Task { await model.choose(country) } } label: {
                        CountryCardView(content: country.content)
                    }
                    .buttonStyle(PressableStyle())
                }
            }
            .padding(Tokens.Space.gutter)
        }
        .background(Tokens.Colors.paper)
    }
}

/// A country as a card: its picture, name and "Learn …". `compact` is the
/// smaller one in Settings.
struct CountryCardView: View {
    let content: Content
    var compact = false

    var body: some View {
        let card = content.card
        VStack(alignment: .leading, spacing: 0) {
            // Compact (Settings): the picture alone fills the card, no name under
            // it (Josh, 2026-10-16); the button's accessibility label names the country
            Color.clear
                .aspectRatio(compact ? 1.2 : 1.9, contentMode: .fit)
                .overlay {
                    AsyncImage(url: card?.image) { phase in
                        if let picture = phase.image { picture.resizable().scaledToFill() } else { Tokens.Colors.sand }
                    }
                }
                .clipped()
            if !compact {
                VStack(alignment: .leading, spacing: 2) {
                    Text(card?.country ?? content.language.appName)
                        .typeface(.display, Tokens.Size.cardTitle, relativeTo: .largeTitle, weight: .bold)
                        .foregroundStyle(Tokens.Colors.ink)
                    if let learn = card?.learn {
                        Text(learn)
                            .typeface(.label, Tokens.Size.cardSubtitle, relativeTo: .body)
                            .foregroundStyle(Tokens.Colors.muted)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Tokens.Space.captionPadding)
                .background(Tokens.Colors.card)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card))
        .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
        .accessibilityElement(children: .combine)
    }

}
