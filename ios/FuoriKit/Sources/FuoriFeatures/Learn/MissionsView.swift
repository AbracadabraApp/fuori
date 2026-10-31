import SwiftUI
import FuoriCore
import FuoriDesign

/// Missions, a placeholder (Josh, 2026-10-30: "link the missions chips mockup
/// to the missions learn area - just a placeholder"). The chip wall from the
/// mockup (design/missions/chip-wall.dc.html): one chip per syllabus unit, in
/// the syllabus's order, from the lessons in /v1/content so both countries
/// get their own. Chips don't open yet and don't warm with use: no heat is
/// tracked (docs/diario.md → Prototype first).
struct MissionsView: View {
    let units: [LessonUnit]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Each chip will warm as you use its phrases with people.")
                    .typeface(.label, 17, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.text)
                ChipFlow(spacing: 10) {
                    ForEach(units) { unit in
                        Text(unit.title)
                            .typeface(.label, 18, relativeTo: .body, weight: .bold)
                            .foregroundStyle(Tokens.Colors.ink)
                            .multilineTextAlignment(.leading)
                            .padding(.vertical, 12)
                            .padding(.horizontal, 18)
                            .frame(minHeight: 44)
                            .background(Tokens.Colors.missions.opacity(0.28), in: Capsule())
                    }
                }
                .accessibilityElement(children: .contain)
                .accessibilityLabel("Missions")
            }
            .padding(.horizontal, Tokens.Space.gutter)
            .padding(.vertical, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Tokens.Colors.paper)
        .navigationTitle("Missions")
    }
}

/// Chips left to right, wrapping to the next line; a chip wider than the
/// screen (the largest text sizes) gets the full width and wraps its text
struct ChipFlow: Layout {
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? .infinity
        let rows = arrange(width: width, subviews: subviews)
        let height = rows.last.map { $0.y + $0.height } ?? 0
        let used = rows.flatMap(\.items).map { $0.x + $0.size.width }.max() ?? 0
        return CGSize(width: proposal.width ?? used, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for row in arrange(width: bounds.width, subviews: subviews) {
            for item in row.items {
                subviews[item.index].place(at: CGPoint(x: bounds.minX + item.x, y: bounds.minY + row.y), proposal: ProposedViewSize(item.size))
            }
        }
    }

    private struct Item { let index: Int; let x: CGFloat; let size: CGSize }
    private struct Row { var y: CGFloat; var height: CGFloat = 0; var items: [Item] = [] }

    private func arrange(width: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = [Row(y: 0)]
        var x: CGFloat = 0
        for (index, subview) in subviews.enumerated() {
            var size = subview.sizeThatFits(.unspecified)
            if size.width > width { size = subview.sizeThatFits(ProposedViewSize(width: width, height: nil)) }
            if x > 0, x + size.width > width {
                let last = rows[rows.count - 1]
                rows.append(Row(y: last.y + last.height + spacing))
                x = 0
            }
            rows[rows.count - 1].items.append(Item(index: index, x: x, size: size))
            rows[rows.count - 1].height = max(rows[rows.count - 1].height, size.height)
            x += size.width + spacing
        }
        return rows
    }
}
