import SwiftUI
import FuoriCore
import FuoriDesign

/// A sheet is presented for one trip
extension Trip: Identifiable {
    public var id: String { "\(from.id)>\(to.id)" }
}

/// The ticket sheet: what you get for picking a city on the departures board
/// (Josh, 2026-11-11; canvas "Station path": "I'd do board - map - city list").
/// Over the city you're leaving: the country's painted map with this trip
/// marked on it, and the ticket lying across the map's lower edge, its stub
/// the board button (an arrow; "Sali", "Subir" to VoiceOver). The stub
/// travels; Cancel stays. No timer
/// and nothing moves.
///
/// The map is one painted picture with no cities on it (content.travelMap);
/// the app draws the two ends of the trip, the route and a few other city
/// names, so a name can't be misspelled or on the wrong coast. A country with
/// no map yet shows the ticket alone, at half height.
struct TripSheet: View {
    let trip: Trip
    let content: Content
    /// The learner tapped the stub: travel once the sheet has gone
    let onBoard: () -> Void
    @Environment(\.dismiss) private var dismiss
    /// How far the ticket lies over the map's lower edge. Small enough that
    /// the southernmost city on the map stays clear of it
    @ScaledMetric(relativeTo: .body) private var overlap: CGFloat = 30

    private var map: TravelMap? {
        guard let map = content.travelMap, map.covers(from: trip.from.id, to: trip.to.id) else { return nil }
        return map
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    if let map {
                        TripMap(trip: trip, map: map, content: content)
                        ticket
                            .rotationEffect(.degrees(-2))
                            .padding(.top, -overlap)
                    } else {
                        ticket
                    }
                }
                .padding(Tokens.Space.gutter)
            }
            .background(Tokens.Colors.paper)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents(map == nil ? [.medium] : [.large])
    }

    /// The ticket and its stub. The shadow is heavy on purpose (Josh: "don't
    /// be too subtle"): the ticket has to read as lying on top of the map
    private var ticket: some View {
        HStack(spacing: 3) {
            TicketStrip(trip: trip, words: content.language.ui.ticket, theme: content.ticketTheme)
            Button {
                onBoard()
                dismiss()
            } label: {
                // Just the arrow (Josh: "just the arrow - more room for text");
                // VoiceOver still says the board word and where to
                Image(systemName: "arrow.forward")
                    .font(.title.weight(.bold))
                    .accessibilityHidden(true)
                    .foregroundStyle(Color(hex: content.ticketTheme.bandInk) ?? Tokens.Colors.card)
                    .frame(minWidth: 56, maxHeight: .infinity)
                    .background(Color(hex: content.ticketTheme.band) ?? Tokens.Colors.green, in: RoundedRectangle(cornerRadius: Tokens.Radius.card))
            }
            .buttonStyle(PressableStyle())
            .accessibilityLabel("\(content.language.ui.ticket.board), \(trip.to.name)")
        }
        .fixedSize(horizontal: false, vertical: true)
        .shadow(color: .black.opacity(0.45), radius: 2, x: 0, y: 1)
        .shadow(color: .black.opacity(0.35), radius: 12, x: 0, y: 6)
    }
}

/// The painted map with one trip drawn on it: the two ends as red town marks
/// with their names, a dashed line between them, and the country's
/// always-named cities as small dots and names
private struct TripMap: View {
    let trip: Trip
    let map: TravelMap
    let content: Content

    var body: some View {
        Color.clear
            .aspectRatio(map.aspect, contentMode: .fit)
            .overlay {
                AsyncImage(url: map.image) { phase in
                    if let picture = phase.image {
                        picture.resizable().scaledToFill()
                    } else {
                        Tokens.Colors.sand
                    }
                }
            }
            .overlay {
                GeometryReader { geo in marks(in: geo.size) }
            }
            .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card))
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity * 2), radius: Tokens.Shadow.card.radius, x: Tokens.Shadow.card.x, y: Tokens.Shadow.card.y)
            // Names on the picture stay a readable size without covering it
            .dynamicTypeSize(...DynamicTypeSize.xLarge)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(trip.from.name), \(trip.to.name)")
    }

    @ViewBuilder private func marks(in size: CGSize) -> some View {
        if let from = map.spot(trip.from.id), let to = map.spot(trip.to.id) {
            let a = point(from, in: size), b = point(to, in: size)
            ZStack {
                // A pale line under the red one, so it shows on any region's colour
                route(a, b).stroke(Tokens.Colors.receipt.opacity(0.75), style: StrokeStyle(lineWidth: 5, lineCap: .round))
                route(a, b).stroke(Tokens.Colors.mapRoute, style: StrokeStyle(lineWidth: 2.5, lineCap: .round, dash: [6, 4]))
                ForEach(map.cities.filter { map.anchors.contains($0.id) && $0.id != from.id && $0.id != to.id }) { spot in
                    anchor(spot, at: point(spot, in: size))
                }
                end(trip.from.name, at: a, other: b, width: size.width, destination: false)
                end(trip.to.name, at: b, other: a, width: size.width, destination: true)
            }
        }
    }

    private func point(_ spot: TravelMap.Spot, in size: CGSize) -> CGPoint {
        CGPoint(x: spot.x * size.width, y: spot.y * size.height)
    }

    /// A gentle curve from one city to the other
    private func route(_ a: CGPoint, _ b: CGPoint) -> Path {
        var path = Path()
        path.move(to: a)
        let bend = 0.15
        path.addQuadCurve(to: b, control: CGPoint(x: (a.x + b.x) / 2 - (b.y - a.y) * bend, y: (a.y + b.y) / 2 + (b.x - a.x) * bend))
        return path
    }

    /// Another city, for orientation: a dot with its name under it
    private func anchor(_ spot: TravelMap.Spot, at point: CGPoint) -> some View {
        VStack(spacing: 1) {
            Circle().fill(Tokens.Colors.mapInk).frame(width: 5, height: 5)
            Text(name(content.city(spot.id)?.name ?? ""))
                .typeface(.display, Tokens.Size.badge - 2, relativeTo: .caption, weight: .semibold)
                .foregroundStyle(Tokens.Colors.mapInk)
                .halo()
                .fixedSize()
        }
        .position(x: point.x, y: point.y + 8)
    }

    /// One end of the trip: a red town mark (ringed at the destination) and the
    /// city's name beside it, on the side away from the other end, and never
    /// off the picture's edge
    private func end(_ city: String, at point: CGPoint, other: CGPoint, width: CGFloat, destination: Bool) -> some View {
        let left = point.x > width * 0.72 || (point.x >= width * 0.28 && point.x <= other.x)
        let box: CGFloat = 170
        return ZStack {
            Text(name(city))
                .typeface(.display, Tokens.Size.body + 1, relativeTo: .body, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
                .halo()
                .lineLimit(1)
                .frame(width: box, alignment: left ? .trailing : .leading)
                .position(x: point.x + (left ? -1 : 1) * (box / 2 + 13), y: point.y)
            if destination {
                Circle().stroke(Tokens.Colors.mapRoute, lineWidth: 1.6).frame(width: 17, height: 17).position(point)
            }
            Circle().fill(Tokens.Colors.mapRoute).frame(width: 10, height: 10)
                .overlay(Circle().stroke(Tokens.Colors.receipt, lineWidth: 1.5))
                .position(point)
        }
    }

    /// A city's name, tagged with the language so it's read and shaped as that language
    private func name(_ city: String) -> AttributedString {
        var s = AttributedString(city)
        s.languageIdentifier = content.language.speechLang
        return s
    }
}

private extension View {
    /// A pale glow behind lettering, so a name reads on any part of the map
    func halo() -> some View {
        shadow(color: Tokens.Colors.receipt, radius: 1.5).shadow(color: Tokens.Colors.receipt, radius: 1.5).shadow(color: Tokens.Colors.receipt, radius: 2.5)
    }
}
