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

    /// The scontrino in the picture's corner (docs/visited-badge.md):
    /// visited after the first conversation there, regular from the third
    @ViewBuilder private func visitBadge(_ place: Place) -> some View {
        if let words = content.language.ui.stamp, let stage = VisitStamp.Stage(visits: model.visits[place.id] ?? 0) {
            VisitStamp(paper: .receipt, stage: stage,
                       word: stage == .regular ? words.regular : words.visited,
                       label: stage == .regular ? words.regularLabel : words.visitedLabel,
                       seed: place.id)
                .padding(10)
        }
    }
}
