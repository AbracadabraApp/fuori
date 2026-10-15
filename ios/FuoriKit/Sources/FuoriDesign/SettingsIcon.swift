import SwiftUI

/// Fuori's settings icon, the same drawing as the web's Settings button
/// (app/components/SettingsButton.tsx): a small circle with eight rays.
/// Josh chose it over the system gear (2026-10-15). Drawn on a 24-point grid
/// and scaled to the text size, like an SF Symbol.
public struct SettingsIcon: View {
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 22

    public init() {}

    public var body: some View {
        Canvas { context, canvasSize in
            let s = canvasSize.width / 24
            let point = { (x: CGFloat, y: CGFloat) in CGPoint(x: x * s, y: y * s) }
            var path = Path()
            path.addEllipse(in: CGRect(x: 9 * s, y: 9 * s, width: 6 * s, height: 6 * s))
            for (a, b) in [((12, 1), (12, 7)), ((12, 17), (12, 23)),
                           ((4.22, 4.22), (8.46, 8.46)), ((15.54, 15.54), (19.78, 19.78)),
                           ((1, 12), (7, 12)), ((17, 12), (23, 12)),
                           ((4.22, 19.78), (8.46, 15.54)), ((15.54, 8.46), (19.78, 4.22))] as [((CGFloat, CGFloat), (CGFloat, CGFloat))] {
                path.move(to: point(a.0, a.1))
                path.addLine(to: point(b.0, b.1))
            }
            context.stroke(path, with: .foreground, style: StrokeStyle(lineWidth: 2.5 * s, lineCap: .round, lineJoin: .round))
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}
