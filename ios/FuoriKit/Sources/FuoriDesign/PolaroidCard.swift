import SwiftUI

/// The feed card, as a polaroid (spec: docs/polaroid-card.md; docs/bugs.md B38 and the card studies, Josh,
/// 2026-11-16: "polaroid - but with a different shadow", "i think curled
/// corners on poloroids", "I think stamp in namespace"): a white frame around
/// a square picture, the name below it, and a shadow that lifts at the two
/// lower corners as a print's corners curl. Whatever is passed as `mark` (the
/// visited stamp) sits beside the name, not over the picture. Before it: the
/// web's PlaceCard, picture to the edges with rounded corners and a soft shadow.
public struct PolaroidCard<Mark: View>: View {
    let image: URL?
    let title: String
    let subtitle: String?
    let mark: Mark

    public init(image: URL?, title: String, subtitle: String? = nil, @ViewBuilder mark: () -> Mark) {
        self.image = image
        self.title = title
        self.subtitle = subtitle
        self.mark = mark()
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
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .top, spacing: 10) {
                    Text(title)
                        .typeface(.display, Tokens.Size.cardTitle, relativeTo: .largeTitle, weight: .bold)
                        // Alegreya's own leading is 1.36 em, so a two-line name
                        // ("Piazza Santa Maria in Trastevere") looked like two
                        // titles, "more like two sentences" (Josh, 2026-11-16,
                        // B38, of the 1.1 em set on 2026-10-21: "tighter still
                        // on leading"). The point size itself; a multiple of
                        // it, so it scales with Dynamic Type.
                        .lineHeight(.multiple(factor: 1.0))
                        .foregroundStyle(Tokens.Colors.ink)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    mark
                }
                if let subtitle {
                    Text(subtitle)
                        .typeface(.label, Tokens.Size.cardSubtitle, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.muted)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 14)
            .padding(.horizontal, 4)
            .padding(.bottom, 6)
        }
        .padding(Tokens.Space.polaroidFrame)
        // The thin shadow on the white card only: a .shadow on the whole card
        // gave every letter of the name its own drop shadow (Josh's screenshot,
        // 2026-11-17)
        .background {
            RoundedRectangle(cornerRadius: Tokens.Radius.polaroid)
                .fill(Tokens.Colors.card)
                .shadow(
                    color: .black.opacity(Tokens.Shadow.polaroid.opacity),
                    radius: Tokens.Shadow.polaroid.radius,
                    x: Tokens.Shadow.polaroid.x,
                    y: Tokens.Shadow.polaroid.y
                )
        }
        .background { CurledCorners() }
        .accessibilityElement(children: .combine)
    }
}

public extension PolaroidCard where Mark == EmptyView {
    /// A card with nothing beside its name
    init(image: URL?, title: String, subtitle: String? = nil) {
        self.init(image: image, title: title, subtitle: subtitle) { EmptyView() }
    }
}

/// The shadow under a print whose lower corners have lifted: two dark bars
/// hidden behind the card near its bottom corners, each turned a few degrees,
/// so only their shadows show, deepest at the corners and gone in the middle
struct CurledCorners: View {
    var body: some View {
        GeometryReader { geo in
            let width = geo.size.width * 0.46
            let y = geo.size.height - 26
            bar(width).rotationEffect(.degrees(-4)).position(x: 10 + width / 2, y: y)
            bar(width).rotationEffect(.degrees(4)).position(x: geo.size.width - 10 - width / 2, y: y)
        }
        .accessibilityHidden(true)
    }

    private func bar(_ width: CGFloat) -> some View {
        Rectangle()
            // Solid, so its shadow is as dark as board 7's box-shadow; a
            // see-through bar cast a shadow half as dark, which read as one
            // faint band rather than two lifted corners (2026-11-17). The bar
            // itself stays hidden behind the card.
            .fill(Color.black)
            .frame(width: width, height: 24)
            .shadow(
                color: .black.opacity(Tokens.Shadow.curl.opacity),
                radius: Tokens.Shadow.curl.radius,
                x: Tokens.Shadow.curl.x,
                y: Tokens.Shadow.curl.y
            )
    }
}
