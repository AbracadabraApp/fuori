import SwiftUI
import FuoriAudio
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The syllabus lessons, from Learn's Lessons card (Josh, 2026-10-29: "link
/// lessons to the Learn home page"). Each unit lists its steps; a step starts
/// the lesson on the conversation screen: Magda teaches, practice dialogues
/// with characters whose role fits, then her review (docs/learn.md → A
/// lesson; LessonFlow). Until Magda picks the next lesson herself (pass 2).
struct LessonsList: View {
    let units: [LessonUnit]
    let player: LessonPlayer
    @Environment(AppModel.self) private var app

    var body: some View {
        List {
            ForEach(units) { unit in
                Section(unit.title) {
                    ForEach(unit.steps) { step in
                        NavigationLink {
                            // Magda teaches, practice, her review (lib/lesson.ts); the read-only page went
                            LessonFlowView(step: step, app: app)
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
