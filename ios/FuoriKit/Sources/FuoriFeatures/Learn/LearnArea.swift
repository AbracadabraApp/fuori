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
                VStack(spacing: 12) {
                    lessonsCard
                    MissionsCard()
                    FlashcardsCard()
                }
                .padding(.horizontal, Tokens.Space.gutter)
                .padding(.bottom, 24)
            }
            .background(Tokens.Colors.paper)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Label("Learn", systemImage: "character.book.closed.fill")
                        .labelStyle(.titleAndIcon)
                        .font(.headline)
                        .foregroundStyle(Tokens.Colors.ink)
                        .tint(Tokens.Colors.green)
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
        .task { home = try? await model.api?.learnHome() }
        .sheet(item: $open) { past in LearnSheet(model: past) }
    }

    private var magda: Character? { model.content?.characters.values.first { $0.tutor } }

    // MARK: Lessons

    private var lessonsCard: some View {
        let lesson = home?.lesson
        return VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                AsyncImage(url: magda?.portrait) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.missions }
                    .frame(width: 72, height: 72)
                    .clipShape(Circle())
                    .overlay { Circle().stroke(Tokens.Colors.card, lineWidth: 3) }
                    .accessibilityHidden(true)
                Text(lessonLine(lesson))
                    .typeface(.label, 16, relativeTo: .callout)
                    .foregroundStyle(Tokens.Colors.ink)
                    .padding(.vertical, 10)
                    .padding(.horizontal, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Tokens.Colors.card, in: UnevenRoundedRectangle(topLeadingRadius: 14, bottomLeadingRadius: 4, bottomTrailingRadius: 14, topTrailingRadius: 14))
            }
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Lessons")
                        .typeface(.display, 28, relativeTo: .title, weight: .bold)
                    Text("with \(magda?.name ?? "Magda")")
                        .typeface(.label, 15, relativeTo: .subheadline)
                }
                .foregroundStyle(Tokens.Colors.card)
                Spacer(minLength: 8)
                if let lesson, let button = model.content?.language.ui.letsDoIt {
                    Button { openLesson(lesson) } label: {
                        Text(inLanguage(button))
                            .typeface(.label, 16, relativeTo: .callout, weight: .bold)
                            .foregroundStyle(Tokens.Colors.lessons)
                            .padding(.vertical, 10)
                            .padding(.horizontal, 18)
                            .frame(minHeight: 44)
                            .background(Tokens.Colors.card, in: Capsule())
                    }
                    .buttonStyle(PressableStyle())
                    .accessibilityHint("Goes over this mistake")
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 200, alignment: .topLeading)
        .background {
            ZStack {
                Tokens.Colors.lessons
                Circle().fill(Tokens.Colors.lessonsShade).frame(width: 180).offset(x: 140, y: 90)
                Circle().fill(Tokens.Colors.lessonsShade).frame(width: 60).offset(x: 120, y: -80)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.12), radius: 4, y: 2)
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

// MARK: - Missions

/// Missions (the mission chips canvas): a market awning and a crate of fruit.
/// Not open yet: the chip wall is the next step
private struct MissionsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Spacer(minLength: 0)
            Text("Missions")
                .typeface(.display, 28, relativeTo: .title, weight: .bold)
            Text("Things to do in town, one at a time.")
                .typeface(.label, 15, relativeTo: .subheadline)
        }
        .foregroundStyle(Tokens.Colors.missionsInk)
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 250, alignment: .bottomLeading)
        .background(alignment: .top) {
            ZStack(alignment: .top) {
                Tokens.Colors.missions
                Awning().frame(height: 60)
                Crate().frame(width: 150, height: 110).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing).padding(.trailing, 18).padding(.bottom, 40)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.12), radius: 4, y: 2)
        .accessibilityElement(children: .combine)
    }
}

private struct Awning: View {
    var body: some View {
        Canvas { ctx, size in
            let stripe = size.width / 12
            ctx.fill(Path(CGRect(x: 0, y: 0, width: size.width, height: size.height - 14)), with: .color(Tokens.Colors.card))
            for i in 0..<12 {
                let x = CGFloat(i) * stripe
                let color = i.isMultiple(of: 2) ? Tokens.Colors.flashcards : Tokens.Colors.card
                var p = Path(CGRect(x: x, y: 0, width: stripe, height: size.height - 14))
                p.addEllipse(in: CGRect(x: x, y: size.height - 28, width: stripe, height: 28))
                ctx.fill(p, with: .color(color))
            }
        }
        .accessibilityHidden(true)
    }
}

private struct Crate: View {
    var body: some View {
        ZStack(alignment: .bottom) {
            RoundedRectangle(cornerRadius: 6).fill(Tokens.Colors.crate).frame(height: 60)
            VStack(spacing: -6) {
                HStack(spacing: -2) { fruit(Tokens.Colors.fruitOrange); fruit(Tokens.Colors.fruitRed); fruit(Tokens.Colors.fruitGreen) }
                HStack(spacing: -2) { fruit(Tokens.Colors.fruitRed); fruit(Tokens.Colors.fruitOrange); fruit(Tokens.Colors.fruitRed); fruit(Tokens.Colors.fruitGreen); fruit(Tokens.Colors.fruitOrange) }
            }
            .padding(.bottom, 48)
        }
        .accessibilityHidden(true)
    }

    private func fruit(_ color: Color) -> some View { Circle().fill(color).frame(width: 26, height: 26) }
}

// MARK: - Flashcards

/// Flashcards (the Flashcards canvas): two cards, one with a cup on it. Not
/// open yet
private struct FlashcardsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Spacer(minLength: 0)
            Text("Flashcards")
                .typeface(.display, 28, relativeTo: .title, weight: .bold)
            Text("Words from your conversations, with pictures.")
                .typeface(.label, 15, relativeTo: .subheadline)
        }
        .foregroundStyle(Tokens.Colors.card)
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 170, alignment: .bottomLeading)
        .background(alignment: .topTrailing) {
            ZStack(alignment: .topTrailing) {
                Tokens.Colors.flashcards
                ZStack {
                    RoundedRectangle(cornerRadius: 8).fill(Tokens.Colors.flashcardsBack).frame(width: 130, height: 80).rotationEffect(.degrees(-10))
                    RoundedRectangle(cornerRadius: 8).fill(Tokens.Colors.card).frame(width: 130, height: 80)
                        .overlay { Image(systemName: "cup.and.saucer").font(.title).foregroundStyle(Tokens.Colors.crate) }
                        .rotationEffect(.degrees(6))
                }
                .padding(.top, 30)
                .padding(.trailing, 24)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.12), radius: 4, y: 2)
        .accessibilityElement(children: .combine)
    }
}
