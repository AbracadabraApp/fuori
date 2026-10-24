import SwiftUI
import FuoriCore
import FuoriDesign

/// Where you're living, Fuori or Afuera (canvas "Launch screen", board 2;
/// Josh, 2026-10-22). The launch picture moves up from the middle of the
/// screen and two cards come in under it, each from that country's
/// /v1/content: its app name, "Italy · learn Italian". At every launch
/// (Josh, 2026-10-23: the one-second picture "pops and goes"; "start with
/// A"); the chosen country loads behind it, so picking it again is
/// immediate.
struct CountryChoiceView: View {
    @Environment(AppModel.self) private var model
    let art: Namespace.ID
    /// Every launch (Josh, 2026-10-23: "start with A"): what a pick does
    /// besides choosing the country, i.e. closing the choice
    var onPick: (() -> Void)? = nil

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                LaunchArt(art: art)
                    // The art's top edge 64 pt down; the picture has 24 pt of room for its shadow
                    .padding(.top, 40)
                VStack(alignment: .leading, spacing: 14) {
                    Text("Where are you living?")
                        .typeface(.label, 17, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.muted)
                        .padding(.horizontal, 4)
                        .accessibilityAddTraits(.isHeader)
                    ForEach(model.countries) { country in
                        Button {
                            onPick?()
                            // The country already loading behind the choice: just go in
                            if onPick != nil, country.server == model.server { return }
                            Task { await model.choose(country) }
                        } label: {
                            CountryPick(content: country.content)
                        }
                        .buttonStyle(PressableStyle())
                    }
                    // First launch only: at every launch it's asked anyway
                    if onPick == nil {
                        Text("You can switch later in Settings.")
                            .typeface(.label, 15, relativeTo: .footnote)
                            .foregroundStyle(Tokens.Colors.muted)
                            .frame(maxWidth: .infinity)
                            .padding(.top, 12)
                    }
                }
                .padding(.horizontal, 16)
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
            .padding(.bottom, 34)
        }
        .scrollBounceBehavior(.basedOnSize)
        .background(Tokens.Colors.paper)
    }
}

/// A country to pick: its app name large ("Fuori"), then "Italy · learn
/// Italian", and a chevron
private struct CountryPick: View {
    let content: Content

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .typeface(.display, 46, relativeTo: .largeTitle, weight: .heavy)
                    .foregroundStyle(Tokens.Colors.ink)
                Text(subtitle)
                    .typeface(.label, 17, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.muted)
            }
            Spacer(minLength: 8)
            Image(systemName: "chevron.right")
                .font(.title3.weight(.semibold))
                .foregroundStyle(Tokens.Colors.green)
                .accessibilityHidden(true)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, minHeight: 88, alignment: .leading)
        .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("\(Text(name)), \(content.card?.country ?? ""): \(content.card?.learn ?? "")"))
    }

    /// The app name, read by VoiceOver in its own language
    private var name: AttributedString {
        var s = AttributedString(content.language.appName)
        s.languageIdentifier = content.language.speechLang
        return s
    }

    /// "Italy · learn Italian"
    private var subtitle: String {
        guard let card = content.card else { return "" }
        return "\(card.country) · \(card.learn.prefix(1).lowercased())\(card.learn.dropFirst())"
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
