import SwiftUI
import FuoriAudio
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The syllabus lessons, from Learn's Lessons card (Josh, 2026-10-29: "link
/// lessons to the Learn home page"). Each unit lists its steps; a step opens
/// the lesson to read and hear, in Magda's voice. An interim view: the agreed
/// lesson is Magda teaching on the conversation screen, practice dialogues
/// with the city's characters, then her review (docs/learn.md → A lesson),
/// which isn't built yet.
struct LessonsList: View {
    let units: [LessonUnit]
    let player: LessonPlayer

    var body: some View {
        List {
            ForEach(units) { unit in
                Section(unit.title) {
                    ForEach(unit.steps) { step in
                        NavigationLink {
                            LessonView(step: step, player: player)
                        } label: {
                            LessonRow(step: step)
                        }
                    }
                }
            }
        }
        .navigationTitle("Lessons")
        .onDisappear { player.stop() }
    }
}

private struct LessonRow: View {
    let step: LessonStep
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(step.title)
                .typeface(.label, 17, relativeTo: .body, weight: .semibold)
                .foregroundStyle(Tokens.Colors.ink)
            Text(step.how_to)
                .typeface(.label, 15, relativeTo: .subheadline)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .padding(.vertical, 4)
    }
}

/// One lesson: Magda's intro, the examples (tap to hear), what to notice, a
/// line of context, and her three questions with the answer to say
struct LessonView: View {
    let step: LessonStep
    let player: LessonPlayer

    var body: some View {
        List {
            Section {
                HStack(alignment: .top, spacing: 12) {
                    AsyncImage(url: player.magda?.portrait) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.sand }
                        .frame(width: 52, height: 52)
                        .clipShape(Circle())
                        .accessibilityHidden(true)
                    Text(step.intro)
                        .typeface(.label, 17, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.ink)
                }
                .padding(.vertical, 4)
            }
            Section("Listen") {
                ForEach(Array(step.examples.enumerated()), id: \.offset) { _, example in
                    PlayRow(said: example.said, english: example.en, caption: example.role.capitalized, player: player)
                }
            }
            Section("Notice") {
                Text(step.notice)
                    .typeface(.label, 17, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.ink)
                if !step.context.isEmpty {
                    Text(step.context)
                        .typeface(.label, 15, relativeTo: .subheadline)
                        .foregroundStyle(Tokens.Colors.muted)
                }
            }
            Section {
                ForEach(Array(step.practice.enumerated()), id: \.offset) { _, item in
                    VStack(alignment: .leading, spacing: 8) {
                        PlayRow(said: item.ask.said, english: item.ask.en, caption: player.magda?.name ?? "Magda", player: player)
                        PlayRow(said: item.answer.said, english: item.answer.en, caption: "You say", player: player)
                    }
                }
            } header: {
                Text("Your turn")
            } footer: {
                Text("Say each answer out loud, then tap it to hear it.")
            }
        }
        .navigationTitle(step.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .onDisappear { player.stop() }
    }
}

/// A line in the language: tap to hear it; its English under it
private struct PlayRow: View {
    let said: String
    let english: String
    let caption: String
    let player: LessonPlayer

    var body: some View {
        Button {
            Task { await player.say(said) }
        } label: {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: player.saying == said ? "speaker.wave.2.fill" : "play.circle.fill")
                    .font(.title3)
                    .foregroundStyle(Tokens.Colors.lessons)
                    .frame(minWidth: 28)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 2) {
                    Text(caption)
                        .typeface(.label, 13, relativeTo: .caption, weight: .semibold)
                        .foregroundStyle(Tokens.Colors.muted)
                    Text(player.inLanguage(said))
                        .typeface(.display, 19, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.ink)
                    Text(english)
                        .typeface(.label, 15, relativeTo: .subheadline)
                        .foregroundStyle(Tokens.Colors.muted)
                }
                Spacer(minLength: 0)
            }
            .frame(minHeight: 44)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityHint("Plays it")
    }
}

/// Says a lesson's lines in Magda's voice (the phone's voice if hers fails)
@MainActor @Observable
final class LessonPlayer {
    let magda: Character?
    private let api: APIClient
    private let language: Language
    private let voice = Voice()
    private(set) var saying: String?
    /// Slower with English on, as in the conversation
    private var speed: Double { UserDefaults.standard.bool(forKey: SettingsKey.english) ? 0.7 : 0.9 }

    init(magda: Character?, api: APIClient, language: Language) {
        self.magda = magda
        self.api = api
        self.language = language
    }

    func say(_ text: String) async {
        voice.stop()
        saying = text
        do {
            guard let magda else { throw CancellationError() }
            let audio = try await api.speak(text: text, characterId: magda.id, speed: speed)
            guard saying == text else { return }
            try AudioSession.activate()
            try await voice.play(audio)
        } catch {
            guard saying == text else { return }
            await voice.speak(text, language: language.speechLang, rate: Float(speed))
        }
        if saying == text { saying = nil }
    }

    func stop() {
        saying = nil
        voice.stop()
    }

    /// Read in the language by VoiceOver
    func inLanguage(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = language.speechLang
        return s
    }
}
