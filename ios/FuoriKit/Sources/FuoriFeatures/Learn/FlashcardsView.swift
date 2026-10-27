import SwiftUI
import FuoriCore
import FuoriDesign

/// The deck (docs/flashcards.md, the Flashcards canvas): every word not yet
/// yours, wide 2:1 cards in a scrolling list, shuffled with five focus words
/// weighing more (Josh, 2026-10-27); each card at its own stage, no helper
/// words; tapping reveals, the mic is an icon; pull to reshuffle. A card with
/// no picture keeps the card's size and centres its cue. Below, your words.
struct FlashcardsView: View {
    let model: FlashcardsModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(model.shown) { card in
                    FlashcardRow(model: model, card: card)
                        .transition(reduceMotion ? .opacity : .move(edge: .bottom).combined(with: .opacity))
                }
                if let note = model.note {
                    Text(note)
                        .typeface(.label, 15, relativeTo: .footnote)
                        .foregroundStyle(Tokens.Colors.muted)
                }
                if !model.own.isEmpty { ownWords }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .animation(reduceMotion ? .easeInOut(duration: 0.2) : .spring(duration: 0.4), value: model.shown)
        }
        .refreshable { model.shuffle() }
        .background(Tokens.Colors.paper)
        .navigationTitle("Flashcards")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .onDisappear { model.stop() }
    }

    private var ownWords: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Your words")
                .typeface(.label, 13, relativeTo: .caption, weight: .semibold)
                .foregroundStyle(Tokens.Colors.muted)
            ForEach(model.own) { card in
                HStack {
                    Text(inLanguage(card.said)).typeface(.label, 17, relativeTo: .body, weight: .bold)
                    Spacer()
                    Text(card.en).typeface(.label, 15, relativeTo: .subheadline).foregroundStyle(Tokens.Colors.muted)
                }
                .frame(minHeight: 44)
            }
        }
        .padding(.top, 8)
    }

    private func inLanguage(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = model.speechLanguage
        return s
    }
}

private struct FlashcardRow: View {
    let model: FlashcardsModel
    let card: Flashcard

    var body: some View {
        let stage = model.stage(card)
        let revealed = model.revealed.contains(card.id)
        VStack(alignment: .leading, spacing: 0) {
            Button { Task { await model.tap(card) } } label: {
                picture(stage: stage)
            }
            .buttonStyle(.plain)
            .disabled(stage == .say)
            .accessibilityLabel(cueLabel(stage))
            .accessibilityHint(stage == .say ? "" : "Shows the answer and says the word")

            HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    switch stage {
                    case .meet:
                        word
                        if revealed { english }
                    case .recall:
                        english
                        if revealed { word }
                    case .say:
                        if revealed { word }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                if stage != .recall && (stage == .say || revealed) { micButton }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .frame(minHeight: 64)
        }
        .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 16))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
        .overlay {
            if model.missed == card.id {
                RoundedRectangle(cornerRadius: 16).stroke(Tokens.Colors.terracotta, lineWidth: 2)
            }
            if model.passed == card.id {
                // Passing stage 3: the one moment of celebration
                ZStack {
                    RoundedRectangle(cornerRadius: 16).fill(Tokens.Colors.green.opacity(0.85))
                    Image(systemName: "checkmark.circle.fill").font(.system(size: 56)).foregroundStyle(Tokens.Colors.card)
                }
                .transition(.opacity)
                .accessibilityLabel("Yours")
            }
        }
    }

    /// The 2:1 picture; without one, the card keeps its size and centres the
    /// English (the cue at stages 2 and 3) or the word (stage 1)
    @ViewBuilder private func picture(stage: FlashcardsModel.Stage) -> some View {
        Color.clear
            .aspectRatio(2, contentMode: .fit)
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

    private var micButton: some View {
        let on = model.listening == card.id
        return Button { Task { await model.mic(card) } } label: {
            ZStack {
                Circle().fill(on ? Tokens.Colors.green : Tokens.Colors.card)
                if model.checking == card.id {
                    ProgressView()
                } else {
                    Image(systemName: on ? "stop.fill" : "mic.fill")
                        .font(.title3)
                        .foregroundStyle(on ? Tokens.Colors.card : Tokens.Colors.green)
                }
            }
            .frame(width: 52, height: 52)
            .overlay { Circle().stroke(Tokens.Colors.green, lineWidth: on ? 0 : 2) }
        }
        .buttonStyle(PressableStyle())
        .disabled(model.checking != nil || (model.listening != nil && !on))
        .accessibilityLabel(on ? "Done" : "Say it")
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
