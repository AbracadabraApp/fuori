import SwiftUI

/// The banner along the bottom of a deck card (docs/flashcards.md → The look):
/// drawn by the app, not the picture, so it can grow with long English and
/// large text sizes. Its outline varies from card to card as on the printed
/// cards Josh liked (2026-10-28: "i like the variation"), picked from the
/// card's id so a card always looks the same. Only the middle stretches; the
/// ends keep their size.
struct CardBanner: Shape {
    enum Style: CaseIterable { case cartouche, notched, rounded, arched }
    let style: Style

    /// A stable pick from the card's id (not `hashValue`, which changes per launch)
    static func style(for id: String) -> Style {
        let sum = id.unicodeScalars.reduce(0) { ($0 &* 31 &+ Int($1.value)) & 0xFFFF }
        return Style.allCases[sum % Style.allCases.count]
    }

    func path(in r: CGRect) -> Path {
        var p = Path()
        switch style {
        case .rounded:
            p.addRoundedRect(in: r, cornerSize: CGSize(width: 10, height: 10))
        case .notched:
            // Corners cut in a quarter circle, like a plaque
            let n = min(14, r.height / 3)
            p.move(to: CGPoint(x: r.minX + n, y: r.minY))
            p.addLine(to: CGPoint(x: r.maxX - n, y: r.minY))
            p.addArc(center: CGPoint(x: r.maxX, y: r.minY), radius: n, startAngle: .degrees(180), endAngle: .degrees(90), clockwise: true)
            p.addLine(to: CGPoint(x: r.maxX, y: r.maxY - n))
            p.addArc(center: CGPoint(x: r.maxX, y: r.maxY), radius: n, startAngle: .degrees(270), endAngle: .degrees(180), clockwise: true)
            p.addLine(to: CGPoint(x: r.minX + n, y: r.maxY))
            p.addArc(center: CGPoint(x: r.minX, y: r.maxY), radius: n, startAngle: .degrees(0), endAngle: .degrees(270), clockwise: true)
            p.addLine(to: CGPoint(x: r.minX, y: r.minY + n))
            p.addArc(center: CGPoint(x: r.minX, y: r.minY), radius: n, startAngle: .degrees(90), endAngle: .degrees(0), clockwise: true)
            p.closeSubpath()
        case .arched:
            // The top edge rises in a shallow arch in the middle
            let rise = min(16, r.height / 4)
            p.move(to: CGPoint(x: r.minX, y: r.minY + rise))
            p.addQuadCurve(to: CGPoint(x: r.maxX, y: r.minY + rise), control: CGPoint(x: r.midX, y: r.minY - rise))
            p.addLine(to: CGPoint(x: r.maxX, y: r.maxY))
            p.addLine(to: CGPoint(x: r.minX, y: r.maxY))
            p.closeSubpath()
        case .cartouche:
            // Rounded ends that pinch in at the middle, like a scroll's curls
            let e = min(18, r.height / 2.5)
            p.move(to: CGPoint(x: r.minX + e, y: r.minY))
            p.addLine(to: CGPoint(x: r.maxX - e, y: r.minY))
            p.addQuadCurve(to: CGPoint(x: r.maxX - e * 0.3, y: r.midY), control: CGPoint(x: r.maxX + e * 0.5, y: r.minY))
            p.addQuadCurve(to: CGPoint(x: r.maxX - e, y: r.maxY), control: CGPoint(x: r.maxX + e * 0.5, y: r.maxY))
            p.addLine(to: CGPoint(x: r.minX + e, y: r.maxY))
            p.addQuadCurve(to: CGPoint(x: r.minX + e * 0.3, y: r.midY), control: CGPoint(x: r.minX - e * 0.5, y: r.maxY))
            p.addQuadCurve(to: CGPoint(x: r.minX + e, y: r.minY), control: CGPoint(x: r.minX - e * 0.5, y: r.minY))
            p.closeSubpath()
        }
        return p
    }
}
