import SwiftUI
import FuoriDesign
import FuoriNetworking

/// The Learn sheet (docs/learn.md → The page, walked through with Josh on
/// 2026-10-21; canvas "Learn sheet", board 3). It opens over the paused scene
/// from the book on the person screen and reviews the conversation so far:
/// corrections as tap-to-fix buttons that say the right phrase in the
/// character's voice, a plain list of their words, and one thing good to know.
/// Replaying text, not the mic: nothing here asks the learner to speak.
/// Test only: Settings → "Learn page (test)", off by default.
struct LearnSheet: View {
    let model: ConversationModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var load: Load = .loading
    /// Corrections the learner has opened
    @State private var opened: Set<Int> = []

    private enum Load {
        case loading
        case failed(String)
        case loaded(APIClient.LearnPage)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    header
                    switch load {
                    case .loading:
                        loading
                    case .failed(let message):
                        failed(message)
                    case .loaded(let page):
                        content(page)
                    }
                }
                .padding(.horizontal, Tokens.Space.gutter)
                .padding(.bottom, 32)
            }
            .background(Tokens.Colors.paper)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Tokens.Colors.paper, for: .navigationBar)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button { dismiss() } label: { Image(systemName: "xmark") }
                        .accessibilityLabel("Close")
                }
            }
        }
        .task { await fetch() }
        .onDisappear { model.closeLearn() }
    }

    private func fetch() async {
        load = .loading
        opened = []
        do {
            load = .loaded(try await model.learnPage())
        } catch {
            load = .failed((error as? APIError)?.message ?? error.localizedDescription)
        }
    }

    // MARK: Header

    /// The book, filled in: the Learn button selected, so the sheet and the
    /// toolbar read as one thing
    private var header: some View {
        HStack(spacing: 12) {
            Image(systemName: "character.book.closed.fill")
                .font(.title3)
                .foregroundStyle(Tokens.Colors.card)
                .frame(width: 44, height: 44)
                .background(Tokens.Colors.green, in: Circle())
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text(model.character.name)
                    .typeface(.display, 26, relativeTo: .title, weight: .bold)
                    .foregroundStyle(Tokens.Colors.ink)
                    .accessibilityAddTraits(.isHeader)
                Text("\(model.character.role.capitalizingFirstLetter), \(model.place.neighbourhood)")
                    .typeface(.label, 15, relativeTo: .subheadline)
                    .foregroundStyle(Tokens.Colors.muted)
            }
        }
        .padding(.top, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Learn: \(model.character.name)")
    }

    // MARK: States

    private var loading: some View {
        VStack(spacing: 12) {
            ProgressView()
            Text("Going over your conversation…")
                .typeface(.label, 15, relativeTo: .subheadline)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 48)
    }

    private func failed(_ message: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(message)
                .typeface(.label, 17, relativeTo: .body)
                .foregroundStyle(Tokens.Colors.text)
            Button("Try again") { Task { await fetch() } }
                .buttonStyle(.glass)
        }
        .padding(.top, 32)
    }

    @ViewBuilder private func content(_ page: APIClient.LearnPage) -> some View {
        let words = page.words.things.count + page.words.doing.count
        if page.corrections.isEmpty && words == 0 && page.goodToKnow.isEmpty {
            Text("Nothing to go over yet. Keep talking with \(model.character.name).")
                .typeface(.label, 17, relativeTo: .body)
                .foregroundStyle(Tokens.Colors.muted)
                .padding(.top, 32)
        }
        if !page.corrections.isEmpty {
            section("Say it this way")
            VStack(spacing: 10) {
                ForEach(Array(page.corrections.enumerated()), id: \.offset) { index, correction in
                    correctionButton(correction, index: index)
                }
            }
        }
        if words > 0 {
            section("\(model.character.name)'s words")
            wordList(page.words)
        }
        if !page.goodToKnow.isEmpty {
            section("Good to know")
            Text(page.goodToKnow)
                .typeface(.label, 17, relativeTo: .body)
                .foregroundStyle(Tokens.Colors.text)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func section(_ title: String) -> some View {
        Text(title)
            .typeface(.label, 14, relativeTo: .footnote, weight: .bold)
            .textCase(.uppercase)
            .foregroundStyle(Tokens.Colors.muted)
            .padding(.top, 24)
            .padding(.bottom, 10)
            .accessibilityAddTraits(.isHeader)
    }

    // MARK: Corrections

    /// One button per correction. Closed: what they said and "Tap to fix", a
    /// moment to fix it themselves. Tapped: why, then the right phrase, said
    /// at once in the character's voice; tapping again says it again.
    private func correctionButton(_ c: APIClient.LearnPage.Correction, index: Int) -> some View {
        let isOpen = opened.contains(index)
        let saying = model.learnSaying == c.right
        return Button {
            opened.insert(index)
            Task { await model.sayForLearn(c.right) }
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("you said \(Text(target(c.said)))")
                        .typeface(.label, isOpen ? 15 : 17, relativeTo: isOpen ? .subheadline : .body)
                        .foregroundStyle(isOpen ? Tokens.Colors.muted : Tokens.Colors.text)
                    Spacer(minLength: 8)
                    if !isOpen {
                        Text("Tap to fix")
                            .typeface(.label, 15, relativeTo: .subheadline, weight: .semibold)
                            .foregroundStyle(Tokens.Colors.green)
                    }
                }
                if isOpen {
                    Text(c.why)
                        .typeface(.label, 16, relativeTo: .callout)
                        .foregroundStyle(Tokens.Colors.text)
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(target(c.right))
                            .typeface(.label, 20, relativeTo: .title3, weight: .semibold)
                            .foregroundStyle(Tokens.Colors.ink)
                        Spacer(minLength: 8)
                        // She's saying it: the only sign of the voice, since it plays by itself
                        Image(systemName: "waveform")
                            .foregroundStyle(Tokens.Colors.green)
                            .symbolEffect(.variableColor.iterative, isActive: saying && !reduceMotion)
                            .opacity(saying ? 1 : 0)
                            .accessibilityHidden(true)
                    }
                    .padding(.top, 4)
                }
            }
            .multilineTextAlignment(.leading)
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
            .padding(14)
            .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
        }
        .buttonStyle(PressableStyle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(isOpen
            ? Text("You said \(Text(target(c.said))). \(c.why) Say it: \(Text(target(c.right)))")
            : Text("You said \(Text(target(c.said)))"))
        .accessibilityHint(isOpen ? "Says it again in \(model.character.name)'s voice" : "Shows how to say it, in \(model.character.name)'s voice")
    }

    // MARK: Words

    /// A plain list, not about speech: things, then doing. Italian on the
    /// left, English on the right; stacked at the accessibility sizes.
    private func wordList(_ words: APIClient.LearnPage.Words) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            if !words.things.isEmpty {
                group("Things")
                ForEach(words.things, id: \.self) { w in
                    wordRow(word: w.word, extra: w.plural, en: w.en)
                }
            }
            if !words.doing.isEmpty {
                group("Doing")
                ForEach(words.doing, id: \.self) { w in
                    wordRow(word: w.infinitive, extra: w.form, en: w.en)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.bottom, 4)
        .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
    }

    private func group(_ title: String) -> some View {
        Text(title)
            .typeface(.label, 13, relativeTo: .caption, weight: .semibold)
            .foregroundStyle(Tokens.Colors.muted)
            .padding(.top, 12)
            .padding(.bottom, 4)
    }

    private func wordRow(word: String, extra: String, en: String) -> some View {
        let layout = typeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 2))
            : AnyLayout(HStackLayout(alignment: .firstTextBaseline, spacing: 12))
        return VStack(spacing: 0) {
            Divider()
            layout {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(target(word))
                        .typeface(.label, 17, relativeTo: .body, weight: .bold)
                        .foregroundStyle(Tokens.Colors.ink)
                    if !extra.isEmpty {
                        Text("· \(Text(target(extra)))")
                            .typeface(.label, 15, relativeTo: .subheadline)
                            .foregroundStyle(Tokens.Colors.muted)
                    }
                }
                if !typeSize.isAccessibilitySize { Spacer(minLength: 8) }
                Text(en)
                    .typeface(.label, 17, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.text)
                    .multilineTextAlignment(typeSize.isAccessibilitySize ? .leading : .trailing)
            }
            .padding(.vertical, 9)
        }
        .accessibilityElement(children: .combine)
    }

    /// Words in the language being learned, tagged so VoiceOver reads them in it
    private func target(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = model.speechLanguage
        return s
    }
}
