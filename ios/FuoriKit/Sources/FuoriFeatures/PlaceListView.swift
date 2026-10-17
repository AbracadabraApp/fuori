import SwiftUI
import FuoriCore
import FuoriDesign

/// Where a place card leads: the person there
struct PersonRoute: Hashable {
    let city: City
    let place: Place
}

/// A city's places in the server's feed order, each with who you meet there.
/// A card opens the person screen; stations open the departures board in N3,
/// so until then their cards aren't buttons.
struct PlaceListView: View {
    let city: City
    let content: Content
    @Environment(AppModel.self) private var model
    @ScaledMetric(relativeTo: .footnote) private var badgeSize: CGFloat = 32

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Tokens.Space.cardGap) {
                ForEach(city.places) { place in
                    if !place.station, content.character(place.characterId) != nil {
                        NavigationLink(value: PersonRoute(city: city, place: place)) { card(place) }
                            .buttonStyle(PressableStyle())
                    } else {
                        card(place)
                    }
                }
            }
            .padding(Tokens.Space.gutter)
        }
        // Always open at the first place. Josh (2026-10-16): tapping a city
        // opened its places part-way down the list. Nothing here set the
        // position, so SwiftUI was choosing it; this pins the start to the top.
        .defaultScrollAnchor(.top, for: .initialOffset)
        .background(Tokens.Colors.paper)
        .navigationTitle(city.name)
        .settingsToolbar()
    }

    private func card(_ place: Place) -> some View {
        PolaroidCard(image: place.image, title: place.name, subtitle: subtitle(place))
            .overlay(alignment: .topTrailing) { visitBadge(place) }
    }

    private func subtitle(_ place: Place) -> String {
        guard let person = content.character(place.characterId) else { return place.neighbourhood }
        return "\(person.name), \(person.role) · \(place.neighbourhood)"
    }

    /// Visits so far; the stamp design comes with the M3 redesign
    @ViewBuilder private func visitBadge(_ place: Place) -> some View {
        if let count = model.visits[place.id], count > 0 {
            Text("\(count)")
                .typeface(.label, Tokens.Size.badge, relativeTo: .footnote, weight: .bold)
                .foregroundStyle(Tokens.Colors.card)
                .frame(minWidth: badgeSize, minHeight: badgeSize)
                .background(Tokens.Colors.green, in: Circle())
                .padding(12)
                .accessibilityLabel("Visited \(count) times")
        }
    }
}
