import SwiftUI
import FuoriCore
import FuoriDesign

/// The greeter's screen (design/onboarding/walkthrough.html): the standard
/// navigation bar with the settings button, her picture filling the rest, her
/// line on a white card and the step's controls at the bottom. Her picture
/// changes with a plain cut, no fade (Josh's pick), with Reduce Motion too.
struct OnboardingView: View {
    let model: OnboardingModel
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack(alignment: .bottom) {
            GuidePicture(url: model.poseURL, lift: model.onboarding.guide.lift)
                .ignoresSafeArea(edges: .bottom)
            VStack(spacing: 10) {
                Spacer(minLength: 0)
                said
                if let note = model.note { noteView(note) }
                controls
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 12)
        }
        .background(Tokens.Colors.paper)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.paper, for: .navigationBar)
        #endif
        .settingsToolbar()
        .task { await model.start() }
        .onDisappear { model.stop() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background { model.stop() }
        }
        .sensoryFeedback(trigger: model.phase) { _, new in
            switch new {
            case .listening: .impact(weight: .light)
            case .thinking: .impact(weight: .heavy)
            case .failed, .micDenied: .error
            default: nil
            }
        }
    }

    // MARK: Her line

    /// Her line types out as she speaks (with Reduce Motion it's all there at
    /// once); the English appears when she has finished
    private var said: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(typed)
                .typeface(.display, 20, relativeTo: .title3, weight: .medium)
                .foregroundStyle(Tokens.Colors.ink)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityLabel(spoken)
            if let english = model.shownEnglish {
                Text(english)
                    .typeface(.label, 15, relativeTo: .callout)
                    .foregroundStyle(Tokens.Colors.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 14)
        .padding(.horizontal, 16)
        .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.15), radius: 8, y: 4)
        .opacity(model.line.isEmpty ? 0 : 1)
    }

    /// The unspoken rest is laid out but clear, so the card has its full size at once
    private var typed: AttributedString {
        var text = AttributedString(model.line)
        text.languageIdentifier = model.language.speechLang
        guard !reduceMotion, let shown = model.shown, shown < model.line.count else { return text }
        let start = text.index(text.startIndex, offsetByCharacters: shown)
        text[start...].foregroundColor = .clear
        return text
    }

    /// What VoiceOver reads: the line so far, in her language
    private var spoken: Text {
        var text = AttributedString(reduceMotion ? model.line : String(model.line.prefix(model.shown ?? model.line.count)))
        text.languageIdentifier = model.language.speechLang
        return Text(text)
    }

    // MARK: Controls

    @ViewBuilder private var controls: some View {
        switch model.phase {
        case .speaking:
            EmptyView()
        case .failed(let message):
            VStack(spacing: 8) {
                Text(message)
                    .typeface(.label, 15, relativeTo: .footnote)
                    .foregroundStyle(Tokens.Colors.errorInk)
                    .multilineTextAlignment(.center)
                Button("Try again") { Task { await model.tryAgain() } }
                    .buttonStyle(.glassProminent)
                    .tint(Tokens.Colors.green)
            }
            .padding(12)
            .frame(maxWidth: .infinity)
            .background(Tokens.Colors.paper.opacity(0.96), in: RoundedRectangle(cornerRadius: 14))
        case .ready, .listening, .thinking, .micDenied:
            switch model.step {
            case .welcome:
                VStack(spacing: 10) {
                    AnswerButton(said: model.onboarding.lines.notYet, language: model.language) { Task { await model.chooseNotYet() } }
                    AnswerButton(said: model.onboarding.lines.some, language: model.language) { Task { await model.chooseSome() } }
                }
                .padding(.top, 6)
            case .beginnerSendOff, .sendOff:
                GoButton(said: model.onboarding.lines.go, language: model.language, busy: model.phase == .thinking) {
                    Task { await model.finish() }
                }
            case .question, .followUp:
                MicBox(model: model)
            }
        }
    }

    private func noteView(_ note: String) -> some View {
        Text(note)
            .typeface(.label, 15, relativeTo: .footnote)
            .foregroundStyle(Tokens.Colors.muted)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 8))
    }
}

/// Her picture, top-anchored, filling the width, lifted by a share of the
/// screen height so her face stays clear of the text. A plain cut between poses.
private struct GuidePicture: View {
    let url: URL?
    let lift: Double

    var body: some View {
        GeometryReader { geo in
            let up = geo.size.height * lift
            AsyncImage(url: url, transaction: Transaction(animation: nil)) { phase in
                if let image = phase.image {
                    image.resizable().scaledToFill()
                } else {
                    Tokens.Colors.sand
                }
            }
            .frame(width: geo.size.width, height: geo.size.height + up, alignment: .top)
            .clipped()
            .offset(y: -up)
        }
        .clipped()
        .accessibilityHidden(true)
    }
}

/// An answer: the language being learned on top, English under, on light olive
/// Liquid Glass with dark text (Josh, 2026-10-16: white on green was hard to read)
private struct AnswerButton: View {
    let said: Onboarding.Line
    let language: Language
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 1) {
                Text(inLanguage(said.line, language))
                    .typeface(.display, 20, relativeTo: .title3, weight: .bold)
                    .foregroundStyle(Tokens.Colors.ink)
                Text(said.en)
                    .typeface(.label, 14, relativeTo: .footnote)
                    .foregroundStyle(Color(red: 0.247, green: 0.290, blue: 0.133)) // #3f4a22, dark olive
            }
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, minHeight: 58)
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .contentShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
        .glassEffect(.regular.tint(Color(red: 0.86, green: 0.89, blue: 0.77).opacity(0.85)).interactive(), in: RoundedRectangle(cornerRadius: 14))
    }
}

/// The go button after a send-off: solid olive
private struct GoButton: View {
    let said: Onboarding.Line
    let language: Language
    let busy: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 1) {
                if busy {
                    ProgressView().tint(.white)
                } else {
                    Text(inLanguage(said.line, language))
                        .typeface(.display, 20, relativeTo: .title3, weight: .bold)
                        .foregroundStyle(.white)
                    Text(said.en)
                        .typeface(.label, 14, relativeTo: .footnote)
                        .foregroundStyle(Color(red: 0.91, green: 0.89, blue: 0.85))
                }
            }
            .frame(maxWidth: .infinity, minHeight: 58)
            .padding(.vertical, 7)
            .background(Tokens.Colors.green, in: RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(PressableStyle())
        .disabled(busy)
    }
}

/// The mic: "Tap to talk", then "Press when done" while they talk, with
/// "Answer in <language> or English" under it (onboarding only)
private struct MicBox: View {
    let model: OnboardingModel

    var body: some View {
        let talking = model.phase == .listening
        VStack(spacing: 6) {
            Button { Task { await model.tapMic() } } label: {
                ZStack {
                    Circle().fill(Tokens.Colors.green)
                    if model.phase == .thinking {
                        ProgressView().tint(.white)
                    } else if talking {
                        RoundedRectangle(cornerRadius: 4).fill(.white).frame(width: 22, height: 22)
                    } else {
                        Image(systemName: "mic.fill").font(.title2).foregroundStyle(.white)
                    }
                }
                .frame(width: 68, height: 68)
                .overlay {
                    if talking {
                        Circle().stroke(Tokens.Colors.green.opacity(0.28), lineWidth: 6 + 6 * model.level).padding(-3)
                    }
                }
            }
            .buttonStyle(PressableStyle())
            .disabled(model.phase == .thinking)
            .accessibilityLabel(talking ? "Press when done" : "Tap to talk")
            Text(model.phase == .micDenied ? "The microphone is off. Turn it on in Settings to answer." : talking ? "Press when done" : "Tap to talk")
                .typeface(.label, 16, relativeTo: .body, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
                .multilineTextAlignment(.center)
            Text("Answer in \(model.language.name) or English")
                .typeface(.label, 14, relativeTo: .footnote)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Tokens.Colors.paper.opacity(0.96), in: RoundedRectangle(cornerRadius: 14))
    }
}

/// Text in the language being learned, so VoiceOver reads it in that language
private func inLanguage(_ text: String, _ language: Language) -> AttributedString {
    var a = AttributedString(text)
    a.languageIdentifier = language.speechLang
    return a
}
