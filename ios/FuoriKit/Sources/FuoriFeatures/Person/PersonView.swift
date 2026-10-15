import SwiftUI
import FuoriCore
import FuoriDesign

/// The person screen (Josh's approved "name on a band", 2026-10-13, in iOS
/// form; docs/13-ios-conventions.md R2, R14): the standard navigation bar with
/// the back button and the gear, then a paper band with the name and
/// "role, neighbourhood", then the portrait filling the rest. Nothing scrolls,
/// so the portrait never slides away. The conversation controls come next in N1.
struct PersonView: View {
    let city: City
    let place: Place
    let character: Character

    var body: some View {
        VStack(spacing: 0) {
            band
            Portrait(url: character.portrait, name: character.name)
        }
        .background(Tokens.Colors.paper)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.paper, for: .navigationBar)
        #endif
        .settingsToolbar()
    }

    private var band: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(character.name)
                .typeface(.display, Tokens.Size.personName, relativeTo: .largeTitle, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
                .accessibilityAddTraits(.isHeader)
            Text("\(character.role), \(place.neighbourhood)")
                .typeface(.label, Tokens.Size.personRole, relativeTo: .title3)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, Tokens.Space.gutter)
        .padding(.top, Tokens.Space.band / 2)
        .padding(.bottom, Tokens.Space.band)
        .background(Tokens.Colors.paper)
        .overlay(alignment: .bottom) { Divider() }
        .zIndex(1)
    }
}

/// The 2:3 portrait, anchored at the top, always at least 124% of the screen
/// width (Josh, 2026-10-13: the same framing on every phone), so the sides are
/// trimmed alike and a short phone loses a little at the bottom instead.
private struct Portrait: View {
    let url: URL?
    let name: String

    var body: some View {
        GeometryReader { geo in
            let width = max(geo.size.width * 1.24, geo.size.height * 2 / 3)
            AsyncImage(url: url) { phase in
                if let image = phase.image {
                    image.resizable().aspectRatio(2 / 3, contentMode: .fill)
                } else {
                    Tokens.Colors.sand
                }
            }
            .frame(width: width, height: width * 3 / 2)
            .frame(width: geo.size.width, height: geo.size.height, alignment: .top)
            .clipped()
        }
        .accessibilityElement()
        .accessibilityLabel(name)
        .accessibilityAddTraits(.isImage)
    }
}
