import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The Learn page (Josh, 2026-11-03; docs/learn.md → The Learn page; mockup
/// design/learn/learn-home.dc.html, canvas "Learn area" F6): one compact
/// screen, opened from the book next to Settings. History (the visited stamp,
/// then cities, people and conversations as split-flap numbers on warm sand;
/// hidden for now, Josh, 2026-11-04); Lessons (the lessons as chips in their areas, green once
/// done, a tap starts one: Magda teaches, practice, her review, LessonFlow;
/// the cultural lessons' sage gem chips sprinkled among them);
/// Flashcards (a banner with three of the deck's cards and the words learned;
/// the whole banner opens the deck). It replaces the three Learn cards and
/// the Missions placeholder. A lesson is done once its review was reached
/// (Josh, 2026-11-03); the server says which (/v1/learn/home).
struct LearnArea: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var home: APIClient.LearnHome?
    /// The lesson (or cultural lesson) open: its id
    @State private var lesson: String?
    /// The deck (docs/flashcards.md), made when Learn opens: the master deck,
    /// or the old starter words from servers before it; nil from servers without either
    @State private var deckModel: FlashcardsModel?
    @State private var showingDeck = false
    @State private var showingEarlier = false
    @State private var homeTried = false
    private static let showsHistory = false

    var body: some View {
        NavigationStack {
            ScrollViewReader { scroller in
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    // History hidden for now (Josh, 2026-11-04: "Remove the scorecard
                    // for now"); the section below stays so it can come back
                    if Self.showsHistory { historySection }
                    // After the server says which set (or fails), so the set doesn't jump
                    if homeTried, let areas = model.content?.lessonAreas, !areas.isEmpty {
                        lessonsSection(areas.filter { $0.lessonSet == currentSet(areas) }, earlier: areas.filter { $0.lessonSet < currentSet(areas) }, culture: model.content?.culture ?? [])
                    }
                    if let deckModel {
                        Button { showingDeck = true } label: { FlashcardsBanner(learned: deckModel.wordsLearned, pictures: deckModel.bannerPictures) }
                            .buttonStyle(PressableStyle())
                            .accessibilityHint("Opens your flashcards")
                            .id("flashcards")
                    }
                }
                .padding(.horizontal, Tokens.Space.gutter)
                .padding(.top, 4)
                .padding(.bottom, 24)
            }
            .background(Tokens.Colors.paper)
            #if DEBUG
            // `-FuoriLearnBottom YES` scrolls to the Flashcards banner, for simulator checks without swiping
            .task(id: deckModel != nil) {
                guard UserDefaults.standard.bool(forKey: "FuoriLearnBottom"), deckModel != nil else { return }
                try? await Task.sleep(for: .seconds(1))
                scroller.scrollTo("flashcards", anchor: .bottom)
            }
            #endif
            }
            .navigationDestination(isPresented: $showingDeck) {
                if let deckModel { FlashcardsView(model: deckModel) }
            }
            .navigationDestination(item: $lesson) { id in
                LessonFlowView(stepId: id, app: model)
            }
            .navigationDestination(isPresented: $showingEarlier) {
                if let areas = model.content?.lessonAreas {
                    EarlierLessons(areas: areas.filter { $0.lessonSet < currentSet(areas) }, done: Set(home?.lessonsDone ?? [])) { step in
                        lesson = step
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Label("Learn", systemImage: "character.book.closed.fill")
                        .labelStyle(.titleAndIcon)
                        .font(.headline)
                        .foregroundStyle(Tokens.Colors.ink)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button { dismiss() } label: { Image(systemName: "xmark") }
                        .accessibilityLabel("Close")
                }
            }
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
        }
        .task {
            makeDeck()
            #if DEBUG
            if UserDefaults.standard.bool(forKey: "FuoriOpenFlashcards"), deckModel != nil { showingDeck = true }
            #endif
            await reload()
        }
        // Back from a lesson or the deck: a chip may have turned green, the words learned grown
        .onChange(of: lesson) { _, now in if now == nil { Task { await reload() } } }
    }

    private func reload() async {
        if let fresh = try? await model.api?.learnHome() { home = fresh }
        homeTried = true
    }

    private func makeDeck() {
        guard deckModel == nil, let content = model.content, let cards = (content.cards?.isEmpty == false ? content.cards : content.flashcards), !cards.isEmpty, let api = model.api else { return }
        deckModel = FlashcardsModel(cards: cards, language: content.language, country: content.country, api: api, tall: content.cards?.isEmpty == false)
    }

    // MARK: History

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 12) {
                if let stamp = model.content?.language.ui.stamp {
                    MiniStamp(word: stamp.visited, label: stamp.visitedLabel, language: model.content?.language.speechLang)
                }
                SectionTitle("History")
            }
            let h = home?.history
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top) { counters(h) }
                VStack(spacing: 14) { counters(h) }
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 10)
            .padding(.top, 16)
            .padding(.bottom, 14)
            .background(Tokens.Colors.historyField, in: RoundedRectangle(cornerRadius: 18))
        }
    }

    @ViewBuilder private func counters(_ h: APIClient.LearnHome.History?) -> some View {
        Spacer(minLength: 0)
        FlipCounter(value: h?.cities, label: "cities", one: "city")
        Spacer(minLength: 0)
        FlipCounter(value: h?.people, label: "people", one: "person")
        Spacer(minLength: 0)
        FlipCounter(value: h?.conversations, label: "conversations", one: "conversation")
        Spacer(minLength: 0)
    }

    // MARK: Lessons

    /// The set the server says to show (the first not all done); until it
    /// answers, the first; a set the content doesn't have, the last it has
    private func currentSet(_ areas: [LessonArea]) -> Int {
        let sets = Set(areas.map(\.lessonSet))
        let wanted = home?.lessonSet ?? 1
        return sets.contains(wanted) ? wanted : (sets.max() ?? 1)
    }

    /// "N of M" counts the set's lessons only; the culture chips don't count
    private func lessonsSection(_ areas: [LessonArea], earlier: [LessonArea], culture: [CultureChip]) -> some View {
        let done = Set(home?.lessonsDone ?? [])
        let all = areas.flatMap(\.chips)
        let count = all.filter { done.contains($0.step) }.count
        return VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                SectionTitle("Lessons")
                Spacer(minLength: 8)
                Text("\(count) of \(all.count)")
                    .typeface(.label, 16, relativeTo: .callout, weight: .bold)
                    .foregroundStyle(Tokens.Colors.lessonsFieldInk)
                    .accessibilityLabel("\(count) of \(all.count) done")
            }
            ChipAreas(areas: areas, culture: culture, done: done) { step in lesson = step }
            // Finished sets stay reachable (Josh, 2026-11-03); no level names
            if !earlier.isEmpty {
                Button { showingEarlier = true } label: {
                    HStack(spacing: 4) {
                        Text("Earlier lessons")
                        Image(systemName: "chevron.right").imageScale(.small)
                    }
                    .typeface(.label, 15, relativeTo: .subheadline, weight: .bold)
                    .foregroundStyle(Tokens.Colors.lessonsAreaInk)
                    .frame(minHeight: 44)
                    .contentShape(Rectangle())
                }
                .buttonStyle(PressableStyle())
                .accessibilityHint("Shows the lessons you've done before")
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 16)
        .padding(.bottom, 18)
        .background(Tokens.Colors.lessonsField, in: RoundedRectangle(cornerRadius: 22))
    }
}

// MARK: - Pieces

/// A set's areas, each with its chips, and the cultural lessons sprinkled
/// among them (docs/culture.md → The chips; Josh, 2026-11-03: no section of
/// their own, any area will do)
struct ChipAreas: View {
    let areas: [LessonArea]
    var culture: [CultureChip] = []
    let done: Set<String>
    let open: (String) -> Void

    enum Item: Hashable {
        case lesson(LessonArea.Chip)
        case culture(CultureChip)
        var id: String { switch self { case .lesson(let c): c.step; case .culture(let c): c.id } }
    }

    /// Culture chip k goes to area k mod n, every second place along; the
    /// same order every time, so a chip doesn't move between visits
    nonisolated static func items(_ areas: [LessonArea], culture: [CultureChip]) -> [[Item]] {
        var rows = areas.map { $0.chips.map(Item.lesson) }
        guard !rows.isEmpty else { return rows }
        var placed = Array(repeating: 0, count: rows.count)
        for (k, chip) in culture.enumerated() {
            let a = k % rows.count
            rows[a].insert(.culture(chip), at: min(1 + placed[a] * 2, rows[a].count))
            placed[a] += 1
        }
        return rows
    }

    var body: some View {
        let rows = Self.items(areas, culture: culture)
        ForEach(Array(areas.enumerated()), id: \.element.name) { i, area in
            VStack(alignment: .leading, spacing: 6) {
                Text(area.name.uppercased())
                    .typeface(.label, 12, relativeTo: .caption, weight: .bold)
                    .tracking(1.2)
                    .foregroundStyle(Tokens.Colors.lessonsAreaInk)
                    .accessibilityAddTraits(.isHeader)
                ChipFlow(spacing: 7) {
                    ForEach(rows[i], id: \.id) { item in
                        switch item {
                        case .lesson(let chip): LessonChip(name: chip.name, done: done.contains(chip.step)) { open(chip.step) }
                        case .culture(let chip): CultureChipButton(name: chip.chip, done: done.contains(chip.id)) { open(chip.id) }
                        }
                    }
                }
            }
        }
    }
}

/// The sets before the one shown, on the same gold, newest first; a chip still starts its lesson
private struct EarlierLessons: View {
    let areas: [LessonArea]
    let done: Set<String>
    let open: (String) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                ForEach(Array(Set(areas.map(\.lessonSet))).sorted(by: >), id: \.self) { n in
                    VStack(alignment: .leading, spacing: 12) {
                        ChipAreas(areas: areas.filter { $0.lessonSet == n }, done: done, open: open)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(Tokens.Colors.lessonsField, in: RoundedRectangle(cornerRadius: 22))
                }
            }
            .padding(.horizontal, Tokens.Space.gutter)
            .padding(.vertical, 8)
        }
        .background(Tokens.Colors.paper)
        .navigationTitle("Earlier lessons")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}

private struct SectionTitle: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text)
            .typeface(.display, 26, relativeTo: .title2, weight: .bold)
            .foregroundStyle(Tokens.Colors.ink)
            .accessibilityAddTraits(.isHeader)
    }
}

/// The visited stamp before History: the visit stamp's ring and words
/// (docs/visited-badge.md), small and tilted; the words from /v1/content
private struct MiniStamp: View {
    let word: String
    let label: String
    let language: String?
    @ScaledMetric(relativeTo: .title2) private var size: CGFloat = 52

    var body: some View {
        var spoken = AttributedString(word)
        spoken.languageIdentifier = language
        return Circle()
            .strokeBorder(Tokens.Colors.rollNew, lineWidth: 2.5)
            .overlay {
                Circle()
                    .strokeBorder(Tokens.Colors.rollNew, lineWidth: 1.2)
                    .padding(5)
                Text(word.uppercased())
                    .typeface(.label, 9, relativeTo: .caption2, weight: .bold)
                    .tracking(0.5)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Tokens.Colors.green)
                    .minimumScaleFactor(0.6)
                    .padding(9)
            }
            .frame(width: size, height: size)
            .rotationEffect(.degrees(-4))
            .accessibilityElement()
            .accessibilityLabel(Text(AttributedString("\(label), ") + spoken))
    }
}

/// A number as split-flap tiles over its label, dark on warm sand (toned
/// down from white on terracotta, Josh, 2026-11-04). Up to four digits; a dash
/// until the server answers
private struct FlipCounter: View {
    let value: Int?
    let label: String
    let one: String

    var body: some View {
        VStack(spacing: 6) {
            HStack(spacing: 4) {
                ForEach(Array(digits.enumerated()), id: \.offset) { _, d in FlapTile(char: d) }
            }
            Text(value == 1 ? one : label)
                .typeface(.label, 19, relativeTo: .headline, weight: .bold)
                .foregroundStyle(Tokens.Colors.historyInk)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .accessibilityElement()
        .accessibilityLabel(value.map { "\($0) \($0 == 1 ? one : label)" } ?? "\(label), loading")
    }

    private var digits: [Swift.Character] {
        guard let value else { return ["–"] }
        return Array(String(min(value, 9999)))
    }
}

private struct FlapTile: View {
    let char: Swift.Character
    @ScaledMetric(relativeTo: .largeTitle) private var height: CGFloat = 50

    var body: some View {
        Text(String(char))
            .typeface(.flip, 40, relativeTo: .largeTitle, weight: .semibold)
            .foregroundStyle(Tokens.Colors.flapInk)
            .frame(width: height * 0.68, height: height)
            .background(Tokens.Colors.flapTile, in: RoundedRectangle(cornerRadius: 5))
            .overlay { Rectangle().fill(Tokens.Colors.flapHinge).frame(height: 2) }
            .minimumScaleFactor(0.5)
    }
}

/// A lesson: green with white words once done, paper with a gold edge before
private struct LessonChip: View {
    let name: String
    let done: Bool
    let action: () -> Void
    private let doneColor = Tokens.Colors.green
    private let edge = Tokens.Colors.chipBorder

    var body: some View {
        Button(action: action) {
            Text(name)
                .typeface(.label, 16, relativeTo: .callout, weight: .bold)
                .foregroundStyle(done ? Color.white : Tokens.Colors.text)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .frame(minHeight: 44)
                .background(done ? doneColor : Tokens.Colors.chip, in: Capsule())
                .overlay { Capsule().strokeBorder(done ? doneColor : edge, lineWidth: 2) }
        }
        .buttonStyle(PressableStyle())
        .accessibilityLabel(done ? "\(name), done" : name)
        .accessibilityHint("Starts this lesson")
    }
}

/// A cultural lesson (docs/culture.md → The chips; mockup G1): a gem before
/// the name; pale teal to do, deep teal with white words and gem once done
private struct CultureChipButton: View {
    let name: String
    let done: Bool
    let action: () -> Void
    @ScaledMetric(relativeTo: .callout) private var gem: CGFloat = 18

    var body: some View {
        Button(action: action) {
            HStack(spacing: 7) {
                Gem(fill: done ? .white : Tokens.Colors.cultureGem, line: done ? Tokens.Colors.cultureGemDone : Tokens.Colors.cultureDone)
                    .frame(width: gem, height: gem)
                    .accessibilityHidden(true)
                Text(name)
                    .typeface(.label, 16, relativeTo: .callout, weight: .bold)
                    .foregroundStyle(done ? Color.white : Tokens.Colors.cultureInk)
            }
            .padding(.leading, 11)
            .padding(.trailing, 14)
            .padding(.vertical, 9)
            .frame(minHeight: 44)
            .background(done ? Tokens.Colors.cultureDone : Tokens.Colors.cultureChip, in: Capsule())
            .overlay { Capsule().strokeBorder(done ? Tokens.Colors.cultureDone : Tokens.Colors.cultureEdge, lineWidth: 2) }
        }
        .buttonStyle(PressableStyle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(done ? "Culture: \(name), done" : "Culture: \(name)")
        .accessibilityAddTraits(.isButton)
        .accessibilityHint("Starts this lesson")
    }
}

/// A faceted gem, drawn on a 24-point grid (mockup G1's icon)
private struct Gem: View {
    let fill: Color
    let line: Color

    var body: some View {
        Canvas { context, size in
            let k = min(size.width, size.height) / 24
            func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x * k, y: y * k) }
            var outline = Path()
            outline.addLines([p(6, 3), p(18, 3), p(22, 9), p(12, 21), p(2, 9)])
            outline.closeSubpath()
            context.fill(outline, with: .color(fill))
            context.stroke(outline, with: .color(line), style: StrokeStyle(lineWidth: 1.6 * k, lineJoin: .round))
            var facets = Path()
            facets.move(to: p(2, 9)); facets.addLine(to: p(22, 9))
            facets.move(to: p(9, 3)); facets.addLine(to: p(12, 9)); facets.addLine(to: p(15, 3))
            facets.move(to: p(12, 9)); facets.addLine(to: p(12, 21))
            facets.move(to: p(7.5, 9)); facets.addLine(to: p(12, 21)); facets.addLine(to: p(16.5, 9))
            context.stroke(facets, with: .color(line), style: StrokeStyle(lineWidth: 1.1 * k, lineJoin: .round))
        }
    }
}

/// Chips left to right, wrapping onto new lines
private struct ChipFlow: Layout {
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(width: proposal.width ?? .infinity, subviews: subviews)
        let width = rows.map { $0.width }.max() ?? 0
        let height = rows.reduce(0) { $0 + $1.height } + spacing * CGFloat(max(rows.count - 1, 0))
        return CGSize(width: proposal.width ?? width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in arrange(width: bounds.width, subviews: subviews) {
            var x = bounds.minX
            for i in row.items {
                let size = subviews[i].sizeThatFits(.init(width: bounds.width, height: nil))
                subviews[i].place(at: CGPoint(x: x, y: y), proposal: .init(width: min(size.width, bounds.width), height: size.height))
                x += min(size.width, bounds.width) + spacing
            }
            y += row.height + spacing
        }
    }

    private struct Row { var items: [Int] = []; var width: CGFloat = 0; var height: CGFloat = 0 }

    private func arrange(width: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = []
        var row = Row()
        for i in subviews.indices {
            let size = subviews[i].sizeThatFits(.init(width: width, height: nil))
            let w = min(size.width, width)
            if !row.items.isEmpty, row.width + spacing + w > width {
                rows.append(row)
                row = Row()
            }
            row.width += (row.items.isEmpty ? 0 : spacing) + w
            row.height = max(row.height, size.height)
            row.items.append(i)
        }
        if !row.items.isEmpty { rows.append(row) }
        return rows
    }
}

/// Flashcards: three of the deck's cards fanned on slate, the words learned
private struct FlashcardsBanner: View {
    let learned: Int
    let pictures: [URL]
    @ScaledMetric(relativeTo: .title) private var height: CGFloat = 168
    @Environment(\.dynamicTypeSize) private var typeSize

    var body: some View {
        HStack(alignment: .center, spacing: 8) {
            VStack(alignment: .leading) {
                // One line: at 26 pt it broke mid-word beside the cards
                Text("Flashcards")
                    .typeface(.display, 26, relativeTo: .title2, weight: .bold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Spacer(minLength: 8)
                // Oswald's lining figures: Alegreya's old-style 0 reads as an o
                Text("\(learned)")
                    .typeface(.flip, 32, relativeTo: .title, weight: .semibold)
                Text(learned == 1 ? "word learned" : "words learned")
                    .typeface(.label, 14, relativeTo: .subheadline)
            }
            .foregroundStyle(.white)
            .padding(18)
            Spacer(minLength: 0)
            // At the accessibility text sizes the words need the room
            if !typeSize.isAccessibilitySize {
                fan
                    .frame(width: 200, height: 168)
                    .accessibilityHidden(true)
            }
        }
        .frame(maxWidth: .infinity, minHeight: height, alignment: .leading)
        .background(Tokens.Colors.flashcards, in: RoundedRectangle(cornerRadius: 22))
        .clipShape(RoundedRectangle(cornerRadius: 22))
        .shadow(color: Tokens.Colors.flashcards.opacity(0.15), radius: 6, y: 4)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Flashcards, \(learned) \(learned == 1 ? "word" : "words") learned")
        .accessibilityAddTraits(.isButton)
    }

    /// Left card tilted one way, right the other, the middle one on top
    private var fan: some View {
        ZStack {
            ForEach(Array(pictures.enumerated()), id: \.offset) { k, url in
                let spot: (x: CGFloat, angle: Double, z: Double, scale: CGFloat) = [(-48, -10, 0, 0.92), (48, 10, 1, 0.92), (0, 0, 2, 1)][min(k, 2)]
                AsyncImage(url: url) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.sand }
                    .frame(width: 100 * spot.scale, height: 150 * spot.scale)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .shadow(color: .black.opacity(0.3), radius: 6, y: 4)
                    .rotationEffect(.degrees(spot.angle))
                    .offset(x: spot.x, y: k == 2 ? -4 : 6)
                    .zIndex(spot.z)
            }
        }
    }
}
