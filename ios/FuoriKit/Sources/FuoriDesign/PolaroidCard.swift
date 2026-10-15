import SwiftUI

/// The feed card from the web (app/components/PlaceCard): a square picture on
/// top, a white caption below, rounded corners and a soft shadow.
public struct PolaroidCard: View {
    let image: URL?
    let title: String
    let subtitle: String?

    public init(image: URL?, title: String, subtitle: String? = nil) {
        self.image = image
        self.title = title
        self.subtitle = subtitle
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Color.clear
                .aspectRatio(1, contentMode: .fit)
                .overlay {
                    AsyncImage(url: image) { phase in
                        if let picture = phase.image {
                            picture.resizable().scaledToFill()
                        } else {
                            Tokens.Colors.sand
                        }
                    }
                }
                .clipped()
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .typeface(.display, Tokens.Size.cardTitle, relativeTo: .largeTitle, weight: .bold)
                    .foregroundStyle(Tokens.Colors.ink)
                if let subtitle {
                    Text(subtitle)
                        .typeface(.label, Tokens.Size.cardSubtitle, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.muted)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Tokens.Space.captionPadding)
            .background(Tokens.Colors.card)
        }
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card))
        .shadow(
            color: .black.opacity(Tokens.Shadow.card.opacity),
            radius: Tokens.Shadow.card.radius,
            x: Tokens.Shadow.card.x,
            y: Tokens.Shadow.card.y
        )
        .accessibilityElement(children: .combine)
    }
}
