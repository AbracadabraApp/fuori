import SwiftUI

/// The visit stamp pinned in the top right corner of a card's picture
/// (docs/visited-badge.md, locked by Josh 2026-10-29): a scontrino for a place
/// (green roll stripe and olive ink after the first visit, red and terracotta
/// from the third), a train ticket stub for a city (visited only). The words
/// come from /v1/content, never from Swift.
public struct VisitStamp: View {
    public enum Paper { case receipt, ticket }
    public enum Stage { case visited, regular }

    let paper: Paper
    let stage: Stage
    /// The stamp's words in the language ("già visto", "di casa")
    let word: String
    /// The English label under it ("Visited", "Regular"), also what VoiceOver reads
    let label: String
    /// Varies the tilt by card, so a list doesn't look machine-stamped
    let seed: String

    @ScaledMetric(relativeTo: .footnote) private var diameter: CGFloat = Tokens.Size.stamp
    @ScaledMetric(relativeTo: .footnote) private var stripe: CGFloat = Tokens.Size.stampStripe

    public init(paper: Paper, stage: Stage, word: String, label: String, seed: String) {
        self.paper = paper
        self.stage = stage
        self.word = word
        self.label = label
        self.seed = seed
    }

    /// The ring's ink, and the darker one for words: terracotta on the receipt
    /// is 4.1:1, under the 4.5:1 text needs, so its words use terracottaInk
    private var ring: Color { stage == .regular ? Tokens.Colors.terracotta : Tokens.Colors.green }
    private var ink: Color { stage == .regular ? Tokens.Colors.terracottaInk : Tokens.Colors.green }
    private var roll: Color { stage == .regular ? Tokens.Colors.rollRegular : Tokens.Colors.rollNew }

    /// About −4° or +4°, a little different per card; the same card always
    /// gets the same tilt (String.hashValue changes between launches)
    private var tilt: Double {
        let sum = seed.unicodeScalars.reduce(0) { ($0 &* 31 &+ Int($1.value)) & 0xffff }
        let side: Double = sum % 2 == 0 ? -1 : 1
        return side * (3 + Double(sum % 3))
    }

    public var body: some View {
        let size = min(diameter, Tokens.Size.stamp * 1.8)
        VStack(spacing: 4) {
            stamp(size)
            Text(label.uppercased())
                .typeface(.label, Tokens.Size.stampLabel, relativeTo: .caption, weight: .bold)
                .tracking(Tokens.Size.stampLabel * 0.1)
                .foregroundStyle(ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.top, 8)
        .padding(.leading, 9)
        .padding(.trailing, 9 + stripe)
        .padding(.bottom, paper == .receipt ? 12 : 8)
        .background {
            ZStack(alignment: .trailing) {
                Tokens.Colors.receipt
                // End of the roll: the warning stripe a till roll shows when it's nearly out
                roll.frame(width: stripe)
                if paper == .ticket { perforation }
            }
            .clipShape(paper == .receipt ? AnyShape(TornReceipt()) : AnyShape(TicketStub()))
            .shadow(color: .black.opacity(Tokens.Shadow.stamp.opacity), radius: Tokens.Shadow.stamp.radius, x: Tokens.Shadow.stamp.x, y: Tokens.Shadow.stamp.y)
        }
        .rotationEffect(.degrees(tilt))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
    }

    /// A round rubber stamp with a double ring, the words inked inside
    private func stamp(_ size: CGFloat) -> some View {
        ZStack {
            Circle().strokeBorder(ring, lineWidth: size * 0.04)
            Circle().strokeBorder(ring, lineWidth: size * 0.015).padding(size * 0.08)
            VStack(spacing: 0) {
                Text(word.uppercased())
                    .typeface(.label, Tokens.Size.stampWord, relativeTo: .caption2, weight: .bold)
                    .tracking(Tokens.Size.stampWord * 0.06)
                    .multilineTextAlignment(.center)
                    .lineSpacing(-2)
                    .foregroundStyle(ink)
                    .minimumScaleFactor(0.6)
                if stage == .regular {
                    // The small underline curve under di casa
                    Smile().stroke(ring, style: StrokeStyle(lineWidth: size * 0.02, lineCap: .round))
                        .frame(width: size * 0.3, height: size * 0.06)
                        .padding(.top, 2)
                }
            }
            .frame(width: size * 0.62)
        }
        .frame(width: size, height: size)
        // Rubber-stamp ink is never solid
        .opacity(0.92)
    }

    /// Train tickets are torn along a perforated line: dots down the left edge
    private var perforation: some View {
        HStack {
            VStack(spacing: 4) {
                ForEach(0..<14, id: \.self) { _ in
                    Circle().fill(Tokens.Colors.paper).frame(width: 2.5, height: 2.5)
                }
            }
            .frame(maxHeight: .infinity)
            .clipped()
            .padding(.leading, 3)
            Spacer()
        }
    }
}

/// Thermal paper cut straight at the top, torn in a zigzag at the bottom
struct TornReceipt: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let tooth: CGFloat = 6
        let depth: CGFloat = 4
        p.move(to: .zero)
        p.addLine(to: CGPoint(x: rect.maxX, y: 0))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - depth))
        var x = rect.maxX
        var down = true
        while x > 0 {
            x = max(0, x - tooth / 2)
            p.addLine(to: CGPoint(x: x, y: down ? rect.maxY : rect.maxY - depth))
            down.toggle()
        }
        p.addLine(to: CGPoint(x: 0, y: rect.maxY - depth))
        p.closeSubpath()
        return p
    }
}

/// A ticket stub: rounded corners and a punched notch halfway down each side
struct TicketStub: Shape {
    func path(in rect: CGRect) -> Path {
        let notch: CGFloat = 5
        var holes = Path()
        for x in [rect.minX, rect.maxX] {
            holes.addEllipse(in: CGRect(x: x - notch, y: rect.midY - notch, width: notch * 2, height: notch * 2))
        }
        return Path(roundedRect: rect, cornerRadius: 3).subtracting(holes)
    }
}

/// The small curve under di casa
struct Smile: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.minY))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY), control: CGPoint(x: rect.midX, y: rect.maxY * 2))
        return p
    }
}

#Preview {
    HStack(spacing: 24) {
        VisitStamp(paper: .receipt, stage: .visited, word: "già visto", label: "Visited", seed: "bar-mattina")
        VisitStamp(paper: .receipt, stage: .regular, word: "di casa", label: "Regular", seed: "pizzeria")
        VisitStamp(paper: .ticket, stage: .visited, word: "già visto", label: "Visited", seed: "roma")
    }
    .padding(40)
    .background(Tokens.Colors.sand)
}
