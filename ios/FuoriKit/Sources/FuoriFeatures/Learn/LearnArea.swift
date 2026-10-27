import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The Learn home (docs/learn.md → The Learn area; canvas "Learn area", D3,
/// Josh's pick on 2026-10-26): the book next to Settings opens three big
/// cards. Lessons is Magda, not at a school or in a city (Josh), picking up
/// your latest real mistake; Missions (the mission chips canvas) and
/// Flashcards (the Flashcards canvas) come next. Until a lesson can be
/// played, "Sì, dai" opens the conversation's Learn page, where the mistake
/// is explained and said in the character's voice.
struct LearnArea: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var home: APIClient.LearnHome?
    @State private var open: PastConversationLearn?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    lessonsCard
                    GlassCard(title: "Missions", line: "Things to do in town, one at a time.", symbol: "basket.fill", tint: Tokens.Colors.missions, ink: Tokens.Colors.ink)
                    if let deck = deckModel {
                        NavigationLink { FlashcardsView(model: deck) } label: { flashcardsCard }
                            .buttonStyle(.plain)
                            .accessibilityHint("Opens your flashcards")
                    } else {
                        flashcardsCard
                    }
                }
                .padding(.horizontal, Tokens.Space.gutter)
                .padding(.top, 4)
                .padding(.bottom, 24)
            }
            .background { Wash() }
            .navigationDestination(isPresented: $showingDeck) {
                if let deckModel { FlashcardsView(model: deckModel) }
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
            home = try? await model.api?.learnHome()
        }
        .sheet(item: $open) { past in LearnSheet(model: past) }
    }

    private var magda: Character? { model.content?.characters.values.first { $0.tutor } }

    private var flashcardsCard: some View {
        GlassCard(title: "Flashcards", line: "Five words at a time, with pictures.", symbol: "rectangle.on.rectangle.angled.fill", tint: Tokens.Colors.flashcards, ink: .white)
    }

    /// The deck (docs/flashcards.md), made when Learn opens, from the
    /// country's starter words; nil from servers without them
    @State private var deckModel: FlashcardsModel?
    /// Debug: `-FuoriOpenFlashcards YES` opens the deck at launch
    @State private var showingDeck = false

    private func makeDeck() {
        guard deckModel == nil, let content = model.content, let cards = content.flashcards, !cards.isEmpty, let api = model.api else { return }
        deckModel = FlashcardsModel(cards: cards, language: content.language, country: content.country, api: api)
    }

    // MARK: Lessons

    /// Glass over the terracotta wash (Josh, 2026-10-26: "a modern look - less
    /// construction paper more glass"): her portrait, her offer in a glass
    /// bubble, and Sì, dai as a prominent glass button
    private var lessonsCard: some View {
        let lesson = home?.lesson
        return VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                AsyncImage(url: magda?.portrait) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.sand }
                    .frame(width: 64, height: 64)
                    .clipShape(Circle())
                    .overlay { Circle().stroke(.white.opacity(0.8), lineWidth: 2) }
                    .accessibilityHidden(true)
                Text(lessonLine(lesson))
                    .typeface(.label, 16, relativeTo: .callout)
                    .foregroundStyle(Tokens.Colors.ink)
                    .padding(.vertical, 10)
                    .padding(.horizontal, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white, in: UnevenRoundedRectangle(topLeadingRadius: 16, bottomLeadingRadius: 4, bottomTrailingRadius: 16, topTrailingRadius: 16))
            }
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Lessons")
                        .typeface(.display, 28, relativeTo: .title, weight: .bold)
                    Text("with \(magda?.name ?? "Magda")")
                        .typeface(.label, 15, relativeTo: .subheadline)
                }
                .foregroundStyle(.white)
                Spacer(minLength: 8)
                if let lesson, let button = model.content?.language.ui.letsDoIt {
                    Button { openLesson(lesson) } label: {
                        Text(inLanguage(button))
                            .typeface(.label, 16, relativeTo: .callout, weight: .bold)
                            .padding(.horizontal, 6)
                            .frame(minHeight: 36)
                    }
                    .buttonStyle(.glassProminent)
                    .tint(.white)
                    .foregroundStyle(Tokens.Colors.lessons)
                    .accessibilityHint("Goes over this mistake")
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .glassEffect(.regular.tint(Tokens.Colors.lessons.opacity(0.92)), in: RoundedRectangle(cornerRadius: 26))
    }

    /// Her offer: your latest mistake, or, before there is one, what lessons are
    private func lessonLine(_ lesson: APIClient.LearnHome.Lesson?) -> AttributedString {
        guard let lesson else {
            return AttributedString("After a few conversations, I'll pick up something you said and go over it with you. Two minutes.")
        }
        var said = AttributedString(lesson.said)
        said.languageIdentifier = model.content?.language.speechLang
        said.inlinePresentationIntent = .emphasized
        return AttributedString("You said “") + said + AttributedString("”. Want to see why? Two minutes.")
    }

    private func openLesson(_ lesson: APIClient.LearnHome.Lesson) {
        guard let content = model.content, let api = model.api,
              let place = content.city(lesson.cityId)?.places.first(where: { $0.id == lesson.placeId }),
              let character = content.character(lesson.characterId) else { return }
        let past = APIClient.PastConversation(id: lesson.conversationId, cityId: lesson.cityId, placeId: lesson.placeId, characterId: lesson.characterId, startedAt: "", lines: 0)
        open = PastConversationLearn(conversation: past, character: character, place: place, language: content.language, api: api)
    }

    private func inLanguage(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = model.content?.language.speechLang
        return s
    }
}

// MARK: - The other cards

/// A Learn card in glass: a tinted symbol in a glass circle, the title and one
/// line. Missions and Flashcards don't open yet
private struct GlassCard: View {
    let title: String
    let line: String
    let symbol: String
    let tint: Color
    /// Text and symbol: white on terracotta and azure, ink on gold (white on
    /// gold is under the 4.5:1 contrast the app keeps)
    let ink: Color

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .typeface(.display, 28, relativeTo: .title, weight: .bold)
                Text(line)
                    .typeface(.label, 15, relativeTo: .subheadline)
            }
            .foregroundStyle(ink)
            Spacer(minLength: 8)
            Image(systemName: symbol)
                .font(.system(size: 30, weight: .semibold))
                .foregroundStyle(ink)
                .frame(width: 72, height: 72)
                .glassEffect(.regular.tint(.white.opacity(0.25)), in: Circle())
                .accessibilityHidden(true)
        }
        .padding(18)
        .frame(maxWidth: .infinity, minHeight: 130, alignment: .leading)
        .glassEffect(.regular.tint(tint.opacity(0.92)), in: RoundedRectangle(cornerRadius: 26))
        .accessibilityElement(children: .combine)
    }
}

/// Behind the glass: soft blurred washes of the three cards' colours on paper
private struct Wash: View {
    var body: some View {
        GeometryReader { geo in
            ZStack {
                Tokens.Colors.paper
                Circle().fill(Tokens.Colors.lessons.opacity(0.35)).frame(width: geo.size.width * 0.9).offset(x: -geo.size.width * 0.25, y: -geo.size.height * 0.28)
                Circle().fill(Tokens.Colors.missions.opacity(0.35)).frame(width: geo.size.width * 0.85).offset(x: geo.size.width * 0.3, y: geo.size.height * 0.02)
                Circle().fill(Tokens.Colors.flashcards.opacity(0.3)).frame(width: geo.size.width * 0.9).offset(x: -geo.size.width * 0.15, y: geo.size.height * 0.32)
            }
            .blur(radius: 60)
        }
        .ignoresSafeArea()
        .accessibilityHidden(true)
    }
}
