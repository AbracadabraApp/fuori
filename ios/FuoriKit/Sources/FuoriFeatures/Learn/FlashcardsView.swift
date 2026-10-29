import SwiftUI
import FuoriCore
import FuoriDesign

/// The feed (docs/flashcards.md; Josh, 2026-10-28: "think of it like an
/// instagram feed"): tall 2:3 cards (the master deck) in an endless scroll, more loading below.
/// Each card at its own stage, no helper words; a card moves along only when
/// its word is said, and one scrolled past comes back later. Answered cards
/// stay as they were. Nothing is dimmed: a card waiting for you looks alive.
/// A card with no picture keeps the card's size and centres its cue. Your
/// words are in the toolbar.
struct FlashcardsView: View {
    let model: FlashcardsModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(model.feed) { item in
                    FlashcardRow(model: model, item: item)
                        // Near the end: more cards (the feed never runs out)
                        .onAppear { if item.id == model.feed.dropLast(1).last?.id || item.id == model.feed.last?.id { model.more() } }
                }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
        }
        .safeAreaInset(edge: .bottom) {
            if let note = model.note {
                Text(note)
                    .typeface(.label, 15, relativeTo: .footnote)
                    .foregroundStyle(Tokens.Colors.text)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Tokens.Colors.card, in: Capsule())
                    .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
                    .padding(.bottom, 8)
            }
        }
        .background(Tokens.Colors.paper)
        .navigationTitle("Flashcards")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                NavigationLink { OwnWords(model: model) } label: {
                    Text("Your words (\(model.own.count))")
                }
            }
        }
        .onDisappear { model.stop() }
    }
}

/// The words that are yours, with when each comes back as a check
private struct OwnWords: View {
    let model: FlashcardsModel

    var body: some View {
        List {
            if model.own.isEmpty {
                Text("Say a word right at the last stage and it's yours. It comes back now and then as a check.")
                    .foregroundStyle(Tokens.Colors.muted)
            }
            ForEach(model.own) { card in
                HStack {
                    Text(inLanguage(card.said)).typeface(.label, 17, relativeTo: .body, weight: .bold)
                    Spacer()
                    Text(card.en).typeface(.label, 15, relativeTo: .subheadline).foregroundStyle(Tokens.Colors.muted)
                }
                .frame(minHeight: 44)
            }
        }
        .navigationTitle("Your words")
    }

    private func inLanguage(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = model.speechLanguage
        return s
    }
}

private struct FlashcardRow: View {
    let model: FlashcardsModel
    let item: FlashcardsModel.Item
    /// The card's size, so the drawn banner covers the picture's own empty
    /// one (about the bottom quarter of a tall card)
    @State private var size: CGSize = .zero

    private var card: Flashcard { item.card }

    var body: some View {
        let stage = model.stage(item)
        let revealed = model.revealed.contains(item.id) || item.done != nil
        ZStack(alignment: .bottom) {
            // Taps are ignored where there's nothing to tap, never shown disabled
            picture(stage: stage)
                .contentShape(Rectangle())
                .onTapGesture { Task { await model.tap(item) } }
                .accessibilityElement()
                .accessibilityLabel(cueLabel(stage))
                .accessibilityAddTraits(tappable(stage) ? .isButton : [])
                .accessibilityHint(hint(stage))

            // The banner the app draws over the picture's own empty one
            // (docs/flashcards.md → The look): it grows with the words
            HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    switch stage {
                    // A card without a picture already shows its cue large
                    // in the picture's place: not again in the banner
                    case .meet:
                        if card.picture != nil { word }
                        if revealed { english }
                    case .recall:
                        if card.picture != nil { english }
                        if revealed { word }
                    case .say:
                        if revealed { word; english }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                if let done = item.done {
                    outcome(done.outcome)
                } else if showsMic(stage) {
                    micButton
                }
            }
            .padding(.horizontal, 22)
            .padding(.vertical, 12)
            .frame(minHeight: model.tall ? max(76, size.height * 0.24) : 76)
            .background {
                let shape = CardBanner(style: CardBanner.style(for: card.id))
                shape.fill(Tokens.Colors.paper).overlay { shape.stroke(Tokens.Colors.ink, lineWidth: 1.5) }
            }
            .padding(.horizontal, model.tall ? size.width * 0.06 : 12)
            .padding(.bottom, model.tall ? size.height * 0.04 : 12)
        }
        .onGeometryChange(for: CGSize.self) { $0.size } action: { size = $0 }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
        .overlay {
            if model.missed == item.id {
                RoundedRectangle(cornerRadius: 16).stroke(Tokens.Colors.terracotta, lineWidth: 2)
            }
            if model.passed == item.id {
                ZStack {
                    RoundedRectangle(cornerRadius: 16).fill(Tokens.Colors.green.opacity(0.85))
                    Image(systemName: "checkmark.circle.fill").font(.system(size: 56)).foregroundStyle(Tokens.Colors.card)
                }
                .transition(.opacity)
                .accessibilityLabel(stage == .say ? "Yours" : "Right")
            }
        }
    }

    /// Stage 1 has no mic until the word has been said; stages 2 and 3 always do
    private func showsMic(_ stage: FlashcardsModel.Stage) -> Bool {
        stage != .meet || model.revealed.contains(item.id) || model.listening == item.id
    }

    private func tappable(_ stage: FlashcardsModel.Stage) -> Bool { item.done == nil && stage != .say }

    private func hint(_ stage: FlashcardsModel.Stage) -> String {
        guard item.done == nil else { return "" }
        switch stage {
        case .meet: return "Shows the English and says the word, then listens"
        case .recall: return "Shows the word"
        case .say: return ""
        }
    }

    /// The picture: tall 2:3 in the master deck, 2:1 in the old starter
    /// words; without one, the card keeps its size and centres the English
    /// (the cue at stages 2 and 3) or the word (stage 1)
    @ViewBuilder private func picture(stage: FlashcardsModel.Stage) -> some View {
        Color.clear
            .aspectRatio(model.tall ? 2.0 / 3.0 : 2, contentMode: .fit)
            .overlay {
                if let url = card.picture {
                    AsyncImage(url: url) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.sand }
                } else {
                    ZStack {
                        Tokens.Colors.sand
                        Text(stage == .meet ? inLanguage(card.said) : AttributedString(card.en))
                            .typeface(.display, 26, relativeTo: .title2, weight: .bold)
                            .foregroundStyle(Tokens.Colors.ink)
                            .multilineTextAlignment(.center)
                            .padding()
                    }
                }
            }
            .clipped()
    }

    private var word: some View {
        Text(inLanguage(card.said))
            .typeface(.display, 30, relativeTo: .title, weight: .heavy)
            .foregroundStyle(Tokens.Colors.ink)
    }

    private var english: some View {
        Text(card.en)
            .typeface(.label, 17, relativeTo: .body)
            .foregroundStyle(Tokens.Colors.text)
    }

    /// An answered card: a tick, or the word to keep working on
    private func outcome(_ outcome: FlashcardsModel.Item.Outcome) -> some View {
        Image(systemName: outcome == .passed ? "checkmark.circle.fill" : "arrow.uturn.down.circle")
            .font(.system(size: 30))
            .foregroundStyle(outcome == .passed ? Tokens.Colors.green : Tokens.Colors.terracotta)
            .frame(width: 52, height: 52)
            .accessibilityLabel(outcome == .passed ? "Said right" : "Comes back soon")
    }

    private var micButton: some View {
        let on = model.listening == item.id
        return Button { Task { await model.mic(item) } } label: {
            ZStack {
                Circle().fill(on ? Tokens.Colors.green : Tokens.Colors.card)
                if model.checking == item.id {
                    ProgressView()
                } else {
                    Image(systemName: on ? "waveform" : "mic.fill")
                        .font(.title3)
                        .symbolEffect(.variableColor.iterative, isActive: on)
                        .foregroundStyle(on ? Tokens.Colors.card : Tokens.Colors.green)
                }
            }
            .frame(width: 52, height: 52)
            .overlay { Circle().stroke(Tokens.Colors.green, lineWidth: on ? 0 : 2) }
        }
        .buttonStyle(PressableStyle())
        .accessibilityLabel(on ? "Listening" : "Say it")
        .accessibilityHint(on ? "Stops when you've finished the word" : "")
    }

    private func cueLabel(_ stage: FlashcardsModel.Stage) -> Text {
        switch stage {
        case .meet: Text(inLanguage(card.said))
        case .recall: Text(card.en)
        case .say: Text(card.picture == nil ? card.en : "Picture. Say the word")
        }
    }

    private func inLanguage(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = model.speechLanguage
        return s
    }
}
