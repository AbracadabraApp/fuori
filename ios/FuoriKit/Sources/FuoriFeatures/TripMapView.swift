import SwiftUI
import FuoriCore
import FuoriDesign

/// The trip's map, shown after boarding at a station ("Sali"), over the
/// destination's places (Josh, 2026-11-11; canvas "Station path": departures,
/// ticket, map, the destination's place list). One painted map of the country
/// with no cities on it (content.travelMap); the app draws on it the two ends
/// of the trip (each city's own building and name), the route between them,
/// and a few other city names for orientation. Under it the trip in words and
/// one line on what the destination is known for.
///
/// No button (Josh: the extra pages made "many clicks"): it holds a few
/// seconds, then goes; a tap anywhere goes at once. With VoiceOver on it
/// waits for the tap. Nothing moves, so Reduce Motion needs no other version.
struct TripMapView: View {
    let trip: Trip
    let map: TravelMap
    let content: Content
    let onDone: () -> Void
    @Environment(\.accessibilityVoiceOverEnabled) private var voiceOver

    var body: some View {
        Button(action: onDone) {
            VStack(spacing: 16) {
                Spacer(minLength: 0)
                picture
                caption
                Spacer(minLength: 0)
            }
            .padding(Tokens.Space.gutter)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Tokens.Colors.paper.ignoresSafeArea())
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isModal)
        .task {
            guard !voiceOver else { return }
            try? await Task.sleep(for: .seconds(3.5))
            if !Task.isCancelled { onDone() }
        }
    }

    private var label: String {
        let known = map.spot(trip.to.id)?.known
        return ["\(trip.from.name), \(trip.to.name).", known].compactMap(\.self).joined(separator: " ")
    }

    private var picture: some View {
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
    }

    /// Everything the app draws on the picture
    @ViewBuilder private func marks(in size: CGSize) -> some View {
        let ends = [trip.from.id, trip.to.id]
        if let from = map.spot(trip.from.id), let to = map.spot(trip.to.id) {
            let a = point(from, in: size), b = point(to, in: size)
            ZStack {
                // The line, then railway ticks across it, as old maps mark a railway
                route(a, b).stroke(Tokens.Colors.mapRoute, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                route(a, b).stroke(Tokens.Colors.mapRoute, style: StrokeStyle(lineWidth: 8, dash: [1.5, 6]))
                ForEach(map.cities.filter { map.anchors.contains($0.id) && !ends.contains($0.id) }) { spot in
                    anchor(spot, at: point(spot, in: size))
                }
                end(from, name: trip.from.name, at: a, side: size.width * 0.2)
                end(to, name: trip.to.name, at: b, side: size.width * 0.2)
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
        let control = CGPoint(x: (a.x + b.x) / 2 - (b.y - a.y) * bend, y: (a.y + b.y) / 2 + (b.x - a.x) * bend)
        path.addQuadCurve(to: b, control: control)
        return path
    }

    /// Another city, for orientation: a dot with its name under it
    private func anchor(_ spot: TravelMap.Spot, at point: CGPoint) -> some View {
        VStack(spacing: 1) {
            Circle().fill(Tokens.Colors.mapInk).frame(width: 5, height: 5)
            Text(name(content.city(spot.id)?.name ?? ""))
                .typeface(.display, Tokens.Size.badge - 3, relativeTo: .caption, weight: .semibold)
                .foregroundStyle(Tokens.Colors.mapInk)
                .fixedSize()
        }
        .position(point)
    }

    /// One end of the trip: the city's building, ink on white laid onto the
    /// paper so the white disappears, with its name; a dot until it's drawn
    private func end(_ spot: TravelMap.Spot, name city: String, at point: CGPoint, side: CGFloat) -> some View {
        VStack(spacing: 0) {
            if let building = spot.building {
                AsyncImage(url: building) { phase in
                    if let picture = phase.image {
                        picture.resizable().scaledToFit().blendMode(.multiply)
                    } else {
                        Color.clear
                    }
                }
                .frame(width: side, height: side)
            } else {
                Circle().fill(Tokens.Colors.mapRoute).frame(width: 10, height: 10)
            }
            Text(name(city))
                .typeface(.display, Tokens.Size.badge, relativeTo: .footnote, weight: .bold)
                .foregroundStyle(Tokens.Colors.mapInk)
                .fixedSize()
        }
        .position(point)
    }

    private var caption: some View {
        VStack(spacing: 8) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 10) { Text(name(trip.from.name)); arrow; Text(name(trip.to.name)) }
                VStack(spacing: 2) { Text(name(trip.from.name)); arrow; Text(name(trip.to.name)) }
            }
            .typeface(.display, Tokens.Size.cardTitle - 4, relativeTo: .title, weight: .bold)
            .foregroundStyle(Tokens.Colors.ink)
            if let known = map.spot(trip.to.id)?.known {
                Text(known)
                    .typeface(.label, Tokens.Size.body, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.text)
                    .multilineTextAlignment(.center)
            }
        }
    }

    private var arrow: some View {
        Image(systemName: "arrow.forward")
            .font(.title3.weight(.semibold))
            .foregroundStyle(Tokens.Colors.mapRoute)
    }

    /// A city's name, tagged with the language so it's read and shaped as that language
    private func name(_ city: String) -> AttributedString {
        var s = AttributedString(city)
        s.languageIdentifier = content.language.speechLang
        return s
    }
}
