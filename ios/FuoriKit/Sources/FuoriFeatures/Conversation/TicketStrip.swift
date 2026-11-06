import SwiftUI
import FuoriCore
import FuoriDesign

/// The ticket on the seller's screen (as on the web, app/components/Ticket.tsx;
/// docs/station-feature-decision.md → Ticket redesign): a carrier band in the
/// country's colour with a vehicle pictogram, the route, platform, seat and
/// fare, and a printed barcode. Words from the language (ui.ticket) and colours
/// from the country (ticketTheme), like the web. No departure time, so it can't
/// contradict the seller. Boarding is the conversation screen's end button
/// ("Sali"), not a button here. VoiceOver reads it as one element (R11).
struct TicketStrip: View {
    let trip: Trip
    let words: TicketWords
    let theme: TicketTheme

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: words.vehicle == "bus" ? "bus.fill" : "tram.fill")
                    .accessibilityHidden(true)
                Text(words.carrier)
                    .typeface(.label, Tokens.Size.badge, relativeTo: .subheadline, weight: .bold)
                Spacer(minLength: 8)
                Text(words.service)
                    .typeface(.label, Tokens.Size.badge - 2, relativeTo: .caption)
            }
            .foregroundStyle(Color(hex: theme.bandInk) ?? Tokens.Colors.card)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color(hex: theme.band) ?? Tokens.Colors.green)

            VStack(alignment: .leading, spacing: 6) {
                // The arrow stays with the destination when a long name wraps
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 6) { Text(trip.from.name); destination }
                    VStack(alignment: .leading, spacing: 2) { Text(trip.from.name); destination }
                }
                .typeface(.display, Tokens.Size.body + 3, relativeTo: .title3, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)

                HStack(alignment: .firstTextBaseline, spacing: 16) {
                    field(words.platform, "\(trip.departure.platform)")
                    field(words.seat, "\(trip.departure.seat)")
                    field(words.fareLabel, words.fare)
                    Spacer(minLength: 0)
                    Barcode()
                        .frame(width: 56, height: 22)
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Tokens.Colors.receipt)
        }
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card))
        .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, x: Tokens.Shadow.card.x, y: Tokens.Shadow.card.y)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(trip.from.name) to \(trip.to.name), \(words.platform) \(trip.departure.platform), \(words.seat) \(trip.departure.seat)")
    }

    private var destination: some View {
        HStack(spacing: 6) {
            Text("→").foregroundStyle(Color(hex: theme.accent) ?? Tokens.Colors.terracotta)
            Text(trip.to.name)
        }
    }

    private func field(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label)
                .typeface(.label, Tokens.Size.badge - 3, relativeTo: .caption2)
                .foregroundStyle(Tokens.Colors.muted)
            Text(value)
                .typeface(.label, Tokens.Size.body, relativeTo: .body, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
        }
    }
}

/// A printed barcode: fixed bars, drawn, so no real ticket's code is copied
private struct Barcode: View {
    private let bars: [CGFloat] = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2]
    var body: some View {
        Canvas { context, size in
            let total = bars.reduce(0, +) * 2
            let unit = size.width / total
            var x: CGFloat = 0
            for (i, w) in bars.enumerated() {
                if i % 2 == 0 { context.fill(Path(CGRect(x: x, y: 0, width: w * unit * 2, height: size.height)), with: .color(Tokens.Colors.ink)) }
                x += w * unit * 2
            }
        }
    }
}

extension Color {
    /// "#1d5c3a" from the country's ticket theme; nil if it isn't a 6-digit hex colour
    init?(hex: String) {
        let digits = hex.trimmingCharacters(in: .whitespaces).replacingOccurrences(of: "#", with: "")
        guard digits.count == 6, let value = UInt32(digits, radix: 16) else { return nil }
        self.init(red: Double((value >> 16) & 0xff) / 255, green: Double((value >> 8) & 0xff) / 255, blue: Double(value & 0xff) / 255)
    }
}
