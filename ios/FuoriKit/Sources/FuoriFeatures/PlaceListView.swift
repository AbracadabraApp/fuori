import SwiftUI
import FuoriCore
import FuoriDesign

/// Where a place card leads: the person there
struct PersonRoute: Hashable {
    let city: City
    let place: Place
}

/// The ticket seller's screen with a ticket bought on the departures board
struct TripRoute: Hashable {
    let city: City
    let place: Place
    let trip: Trip
}

/// A city's places in the server's feed order, each with who you meet there.
/// A card opens the person screen; a cinema's card opens its films; the station's card opens the departures
/// board, and picking a city there opens the ticket seller with that ticket.
struct PlaceListView: View {
    let city: City
    let content: Content
    @Environment(AppModel.self) private var model
    /// The station whose departures board is open
    @State private var board: Place?
    /// The destination picked on the board, opened once the sheet has closed
    @State private var picked: TripRoute?
    @State private var trip: TripRoute?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Tokens.Space.cardGap) {
                ForEach(city.places) { place in
                    if place.films?.isEmpty == false {
                        NavigationLink(value: CinemaRoute(place: place)) { card(place) }
                            .buttonStyle(PressableStyle())
                            .accessibilityHint("Shows the films")
                    } else if content.character(place.characterId) == nil {
                        card(place)
                    } else if place.station {
                        Button { board = place } label: { card(place) }
                            .buttonStyle(PressableStyle())
                            .accessibilityHint(content.language.ui.whereTo)
                    } else {
                        NavigationLink(value: PersonRoute(city: city, place: place)) { card(place) }
                            .buttonStyle(PressableStyle())
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
        // One sheet at a time, then the push (R10): the seller opens once the board has gone
        .sheet(item: $board, onDismiss: {
            trip = picked
            picked = nil
        }) { station in
            DeparturesView(city: city, content: content) { destination in
                picked = TripRoute(city: city, place: station, trip: Trip(from: city, to: destination))
            }
        }
        .navigationDestination(for: CinemaRoute.self) { route in CinemaView(place: route.place) }
        .navigationDestination(item: $trip) { route in
            if let seller = content.character(route.place.characterId),
               let conversation = model.stationConversation(city: route.city, place: route.place, character: seller, to: route.trip.to) {
                PersonView(model: conversation)
            }
        }
    }

    private func card(_ place: Place) -> some View {
        PolaroidCard(image: place.image, title: place.name, subtitle: subtitle(place))
            .overlay(alignment: .top) { chalkMenu(place) }
            .overlay(alignment: .topTrailing) { visitBadge(place) }
    }

    /// The menu written in chalk on the picture's blank board (Josh,
    /// 2026-11-06: "Blank board"; the picture was made with the board left
    /// empty for it). The board's place comes from content; the picture is
    /// the card's width square, so the fractions are of the card's width
    @ViewBuilder private func chalkMenu(_ place: Place) -> some View {
        if let menu = place.menu, let board = place.menuBoard {
            GeometryReader { geo in
                let side = geo.size.width
                VStack(spacing: 4) {
                    ForEach(menu, id: \.self) { dish in
                        Text(chalk(dish))
                            .typeface(.display, 16, relativeTo: .body, weight: .semibold)
                            .foregroundStyle(Tokens.Colors.flapInk)
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .minimumScaleFactor(0.5)
                    }
                }
                .dynamicTypeSize(.large)
                .frame(width: side * board.width, height: side * board.height)
                .offset(x: side * board.x, y: side * board.y)
            }
            .aspectRatio(1, contentMode: .fit)
            .allowsHitTesting(false)
        }
    }

    private func chalk(_ dish: String) -> AttributedString {
        var s = AttributedString(dish)
        s.languageIdentifier = content.language.speechLang
        return s
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
