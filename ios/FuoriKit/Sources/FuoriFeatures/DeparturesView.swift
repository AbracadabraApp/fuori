import SwiftUI
import FuoriCore
import FuoriDesign

/// The departures board, opened by tapping the station (docs/station-feature-
/// decision.md; docs/13-ios-conventions.md R10): a sheet titled with the
/// language's "Dove vuoi andare?", Cancel leading. Josh, 2026-11-11 (canvas
/// "Station path", light board): the plain list was austere and its rows
/// didn't look tappable. Now the station's own picture in an arched station
/// window with its name on an enamel sign, column headings, and each city a
/// raised card: its building (an engraving, where the country has them), its
/// name on split-flap tiles, its platform from here, and a chevron. The current city is disabled and says so in words ("Sei qui"),
/// not only in colour. First-screen cities, then the rest after "show more",
/// as on the city list. Picking a city closes the sheet; the place list then
/// opens the ticket seller with that ticket.
struct DeparturesView: View {
    let city: City
    let station: Place
    let content: Content
    let onPick: (City) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var showsMore = false
    @ScaledMetric(relativeTo: .body) private var thumb: CGFloat = 48

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 10) {
                    StationWindow(image: station.image)
                    sign
                    headings
                    ForEach(destinations) { destination in
                        Button {
                            onPick(destination)
                            dismiss()
                        } label: {
                            row(destination)
                        }
                        .buttonStyle(PressableStyle())
                        .disabled(destination.id == city.id)
                    }
                    if !showsMore, !content.moreCities.isEmpty {
                        Button(content.language.ui.showMore) { showsMore = true }
                            .typeface(.label, Tokens.Size.body, relativeTo: .body, weight: .semibold)
                            .frame(minHeight: 44)
                    }
                }
                .padding(Tokens.Space.gutter)
            }
            .background(Tokens.Colors.paper)
            .navigationTitle(content.language.ui.whereTo)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    /// First-screen cities; the rest once "show more" is tapped. A city reached
    /// from "more" starts with them shown, so "Sei qui" is on the board
    private var destinations: [City] {
        let more = showsMore || content.moreCities.contains { $0.id == city.id }
        return content.firstScreenCities + (more ? content.moreCities : [])
    }

    /// The station's name, white on blue, like the sign on a platform
    private var sign: some View {
        Text(station.name)
            .typeface(.label, Tokens.Size.badge, relativeTo: .subheadline, weight: .bold)
            .foregroundStyle(Tokens.Colors.card)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 14)
            .padding(.vertical, 6)
            .background(Tokens.Colors.stationSign, in: RoundedRectangle(cornerRadius: 5))
            .overlay(RoundedRectangle(cornerRadius: 5).strokeBorder(Tokens.Colors.card, lineWidth: 2))
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity * 2), radius: Tokens.Shadow.card.radius, x: Tokens.Shadow.card.x, y: Tokens.Shadow.card.y)
            .padding(.top, -24)
            .accessibilityAddTraits(.isHeader)
    }

    /// Column headings in the language: the cities, the platform
    @ViewBuilder private var headings: some View {
        let words = content.language.ui.ticket
        if let destination = words.destination {
            HStack {
                Text(destination)
                Spacer(minLength: 8)
                Text(words.platform)
                    // Over the platform tiles, clear of the chevron
                    .padding(.trailing, 26)
            }
            .typeface(.label, Tokens.Size.badge - 2, relativeTo: .caption, weight: .semibold)
            .textCase(.uppercase)
            .foregroundStyle(Tokens.Colors.muted)
            .padding(.horizontal, 12)
            .padding(.top, 6)
            .accessibilityHidden(true)
        }
    }

    /// The city's building, ink on white laid onto the white card so its
    /// paper disappears. Countries with no buildings yet show none; a city
    /// whose building isn't drawn keeps the space, so the names line up
    @ViewBuilder private func building(_ destination: City) -> some View {
        if let map = content.travelMap {
            AsyncImage(url: map.spot(destination.id)?.building) { phase in
                if let picture = phase.image {
                    picture.resizable().scaledToFit().blendMode(.multiply)
                } else {
                    Color.clear
                }
            }
            .frame(width: thumb, height: thumb)
            .accessibilityHidden(true)
        }
    }

    private func row(_ destination: City) -> some View {
        let here = destination.id == city.id
        let words = content.language.ui.ticket
        let platform = Departure(from: city.id, to: destination.id).platform
        return HStack(spacing: 10) {
            building(destination)
            VStack(alignment: .leading, spacing: 4) {
                FlapWord(text: destination.name, language: content.language.speechLang)
                if let region = destination.region {
                    Text(region)
                        .typeface(.label, Tokens.Size.badge - 2, relativeTo: .caption)
                        .foregroundStyle(Tokens.Colors.muted)
                }
            }
            Spacer(minLength: 8)
            if here {
                Text(content.language.ui.youAreHere)
                    .typeface(.label, Tokens.Size.badge, relativeTo: .subheadline, weight: .semibold)
                    .foregroundStyle(Tokens.Colors.muted)
            } else {
                // The platform as two flaps, as on a station board
                FlapWord(text: platform < 10 ? "0\(platform)" : "\(platform)", language: content.language.speechLang)
                Image(systemName: "chevron.forward")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Tokens.Colors.green)
                    .accessibilityHidden(true)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(minHeight: 56)
        .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: Tokens.Radius.card))
        .shadow(color: .black.opacity(here ? 0 : Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, x: Tokens.Shadow.card.x, y: Tokens.Shadow.card.y)
        .opacity(here ? 0.65 : 1)
        .contentShape(Rectangle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(here ? "\(destination.name), \(content.language.ui.youAreHere)" : "\(destination.name), \(words.platform) \(platform)")
    }
}

/// A word on split-flap tiles, one letter a tile. When the letters don't fit
/// the width (a long name, or large text), the whole word on one tile
private struct FlapWord: View {
    let text: String
    let language: String
    @ScaledMetric(relativeTo: .body) private var width: CGFloat = 19
    @ScaledMetric(relativeTo: .body) private var height: CGFloat = 28

    var body: some View {
        let letters = Array(text.uppercased(with: Locale(identifier: language)))
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 2) {
                ForEach(Array(letters.enumerated()), id: \.offset) { _, letter in
                    if letter == " " {
                        Color.clear.frame(width: width / 2, height: height)
                    } else {
                        tile(String(letter)).frame(width: width)
                    }
                }
            }
            tile(String(letters))
        }
    }

    private func tile(_ word: String) -> some View {
        Text(word)
            .typeface(.flip, Tokens.Size.body, relativeTo: .body, weight: .semibold)
            .foregroundStyle(Tokens.Colors.flapInk)
            .lineLimit(2)
            .minimumScaleFactor(0.7)
            .padding(.horizontal, word.count > 1 ? 8 : 0)
            .frame(minHeight: height)
            .frame(maxWidth: word.count > 1 ? nil : .infinity)
            .background(Tokens.Colors.flapTile, in: RoundedRectangle(cornerRadius: 3))
            // The hinge across the middle of the flap
            .overlay(Rectangle().fill(Tokens.Colors.flapHinge).frame(height: 1))
    }
}

/// The station's picture seen through a half-round station window: an iron
/// frame with ribs fanning from the middle of the sill
private struct StationWindow: View {
    let image: URL?

    var body: some View {
        Color.clear
            .aspectRatio(2, contentMode: .fit)
            .overlay {
                AsyncImage(url: image) { phase in
                    if let picture = phase.image {
                        picture.resizable().scaledToFill()
                    } else {
                        Tokens.Colors.sand
                    }
                }
            }
            .clipShape(Fanlight())
            .overlay(FanlightRibs().stroke(Tokens.Colors.flapTile, lineWidth: 3))
            .overlay(Fanlight().stroke(Tokens.Colors.flapTile, lineWidth: 5))
            .accessibilityHidden(true)
    }
}

/// A half circle standing on its flat side; the frame is twice as wide as tall
private struct Fanlight: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addArc(center: CGPoint(x: rect.midX, y: rect.maxY), radius: rect.width / 2, startAngle: .degrees(180), endAngle: .degrees(0), clockwise: false)
        path.closeSubpath()
        return path
    }
}

/// The window's ribs: five spokes from the sill's middle and a small inner arch
private struct FanlightRibs: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let centre = CGPoint(x: rect.midX, y: rect.maxY)
        let radius = rect.width / 2
        for degrees in [210.0, 240, 270, 300, 330] {
            let angle = degrees * .pi / 180
            path.move(to: CGPoint(x: centre.x + radius * 0.3 * cos(angle), y: centre.y + radius * 0.3 * sin(angle)))
            path.addLine(to: CGPoint(x: centre.x + radius * cos(angle), y: centre.y + radius * sin(angle)))
        }
        path.move(to: CGPoint(x: centre.x - radius * 0.3, y: centre.y))
        path.addArc(center: centre, radius: radius * 0.3, startAngle: .degrees(180), endAngle: .degrees(0), clockwise: false)
        return path
    }
}
