import SwiftUI
import FuoriCore
import FuoriDesign
#if canImport(UIKit)
import UIKit
#endif

/// The person screen (Josh's approved "name on a band", 2026-10-13, in iOS
/// form; docs/13-ios-conventions.md R2, R14): the standard navigation bar with
/// the back button and the settings button, a paper band with the name and
/// "Role, neighbourhood", then the portrait running to the bottom edge, with
/// the subtitles and the conversation controls over its lower part. The
/// portrait never scrolls, so it never slides away; at the largest text sizes
/// the subtitles and controls scroll over it. Opening the screen starts the
/// conversation (hands-free); leaving it saves.
struct PersonView: View {
    @State private var model: ConversationModel
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage(SettingsKey.subtitles) private var subtitles = true
    @AppStorage(SettingsKey.english) private var english = false
    @AppStorage(SettingsKey.debug) private var debug = false
    @State private var showingLearn = false
    @Environment(AppModel.self) private var appModel
    @Environment(\.dismiss) private var dismiss

    init(model: ConversationModel) {
        _model = State(initialValue: model)
    }

    var body: some View {
        VStack(spacing: 0) {
            // The intro (Josh's design, 2026-11-11): the portrait alone with the
            // subtitle band while the character sets the scene; the name band
            // and the chat come in on the first question
            if !model.inIntro { band }
            ZStack(alignment: .bottom) {
                Portrait(url: model.character.portrait, name: model.character.name)
                    .ignoresSafeArea(edges: .bottom)
                if model.inIntro, let subtitle = model.introSubtitle {
                    IntroSubtitle(english: subtitle.en)
                        .ignoresSafeArea(edges: .bottom)
                        .transition(.opacity)
                }
                if debug {
                    DebugPanel(info: model.debug, conversationId: model.conversationId)
                        .frame(maxHeight: .infinity, alignment: .top)
                        .padding(.horizontal, Tokens.Space.gutter)
                        .padding(.top, 8)
                }
                // Over the portrait; when it doesn't fit (the largest text
                // sizes), it scrolls from the bottom, and the portrait stays put
                if !model.inIntro {
                    ViewThatFits(in: .vertical) {
                        overlay
                        ScrollView { overlay }
                            .defaultScrollAnchor(.bottom)
                            .scrollIndicators(.hidden)
                    }
                    .transition(.opacity)
                }
            }
        }
        .animation(.easeInOut(duration: 0.4), value: model.inIntro)
        .background(Tokens.Colors.paper)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.paper, for: .navigationBar)
        #endif
        .sheet(isPresented: $showingLearn, onDismiss: { model.closeLearn() }) {
            LearnSheet(model: model)
        }
        .settingsToolbar()
        .task { await model.start() }
        // Hands-free means no taps, so without this the phone auto-locks
        // mid-conversation and backgrounding ends the learner's turn
        .onAppear { KeepAwake.hold() }
        // Every way out (back button, edge swipe) saves through leave()
        .onDisappear { model.leave(); KeepAwake.release() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background { model.backgrounded() }
        }
        // Their goodbye, said back, ends it (docs/beginner-scaffolding.md 11b):
        // once it's been said, back to the place, saving as every exit does
        .onChange(of: model.phase) { _, phase in
            guard phase == .finished, model.endButton == nil else { return }
            Task {
                try? await Task.sleep(for: .seconds(1.5))
                dismiss()
            }
        }
    }

    /// The bubbles or subtitles and the controls
    private var overlay: some View {
        VStack(spacing: 8) {
            // While scaffolding: the words and the English always
            // (docs/beginner-scaffolding.md)
            let showLine = model.scaffolding || subtitles
            let showEnglish = model.scaffolding || english
            // Beginner dialogue: her English is heard, her words in the language are bubbles. Parts that are only
            // the answers to say back (Beginner 2 on the one-line reply, 2026-11-11): her line is the subtitle as
            // at every other level, and the answers show on the learner's turn (ConversationControls)
            if model.parts?.contains(where: { !$0.isAnswer }) == true {
                BeginnerBubbles(parts: model.shownParts, speechLanguage: model.speechLanguage)
                if let note { Subtitles(line: nil, shown: nil, english: nil, note: note) }
            } else {
                Subtitles(line: showLine ? model.chatLine : nil, shown: model.chatShown, english: showEnglish ? model.chatEnglish : nil, note: note, hint: model.openerHint)
            }
            // At the station: your ticket, just above the talking controls (as on the web)
            if let trip = model.trip, let content = appModel.content {
                TicketStrip(trip: trip, words: content.language.ui.ticket, theme: content.ticketTheme)
            }
            // No Learn link in the welcome: it's not a conversation to go over
            ConversationControls(model: model, onLearn: learnAction)
        }
        .padding(.horizontal, Tokens.Space.gutter)
    }

    /// The Learn link's action; none in the welcome
    private var learnAction: (() -> Void)? {
        if model.welcome { return nil }
        return { openLearn() }
    }

    /// The Learn link: pause the scene, then the Learn sheet over it
    private func openLearn() {
        model.openLearn()
        showingLearn = true
    }

    /// The note above the controls: what went wrong, or a hint like "Didn't catch that."
    private var note: String? {
        switch model.phase {
        case .micDenied: "The microphone is off for Fuori. Turn it on in Settings to talk."
        default: model.note
        }
    }

    private var band: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(model.character.name)
                .typeface(.display, Tokens.Size.personName, relativeTo: .largeTitle, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
                .accessibilityAddTraits(.isHeader)
            Text("\(model.character.role.capitalizingFirstLetter), \(model.place.neighbourhood)")
                .typeface(.label, Tokens.Size.personRole, relativeTo: .title3)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, Tokens.Space.gutter)
        .padding(.top, Tokens.Space.band / 2)
        .padding(.bottom, Tokens.Space.band)
        .background(Tokens.Colors.paper)
        .overlay(alignment: .bottom) { Divider() }
        .zIndex(1)
    }
}

/// The intro's subtitle over the bottom of the portrait, like a film's
/// (Josh, 2026-11-11, after playing it): the language runs as one continuous
/// dialogue with nothing of it written, and the English of the sentence being
/// said shows on its own, replaced by the next as the speech moves on. On a
/// dark fade so it reads on any portrait. The chat's own bubble takes over on
/// the question.
struct IntroSubtitle: View {
    let english: String
    @ScaledMetric(relativeTo: .title3) private var size: CGFloat = 19

    var body: some View {
        Text(english)
            .font(.system(size: size, weight: .semibold))
            .lineSpacing(size * 0.2)
            .foregroundStyle(Tokens.Colors.card)
            .id(english)
            .transition(.opacity)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Tokens.Space.gutter)
            .padding(.top, 48)
            .padding(.bottom, 28)
            .background(
                LinearGradient(colors: [Tokens.Colors.flapTile.opacity(0), Tokens.Colors.flapTile.opacity(0.85)], startPoint: .top, endPoint: .bottom)
            )
            .animation(.easeInOut(duration: 0.25), value: english)
    }
}

/// The 2:3 portrait, anchored at the top, always at least 124% of the screen
/// width (Josh, 2026-10-13: the same framing on every phone), so the sides are
/// trimmed alike and a short phone loses a little at the bottom instead.
struct Portrait: View {
    let url: URL?
    let name: String

    var body: some View {
        GeometryReader { geo in
            let width = max(geo.size.width * 1.24, geo.size.height * 2 / 3)
            AsyncImage(url: url) { phase in
                if let image = phase.image {
                    image.resizable().aspectRatio(2 / 3, contentMode: .fill)
                } else {
                    Tokens.Colors.sand
                }
            }
            .frame(width: width, height: width * 3 / 2)
            .frame(width: geo.size.width, height: geo.size.height, alignment: .top)
            .clipped()
        }
        .accessibilityElement()
        .accessibilityLabel(name)
        .accessibilityAddTraits(.isImage)
    }
}

extension String {
    /// "fruttivendolo" → "Fruttivendolo", as the web shows roles
    var capitalizingFirstLetter: String { prefix(1).uppercased() + dropFirst() }
}

/// The hidden debug panel (Settings → Developer), as the web's ?debug=1:
/// prompt version, whether the conversation is saved, what was heard, which
/// voice spoke, step timings and the last error code
private struct DebugPanel: View {
    let info: ConversationModel.DebugInfo
    let conversationId: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            row("Prompt", info.promptVersion)
            row("Saved", conversationId.map { "yes (\(String($0.prefix(8))))" } ?? "no")
            row("Heard", info.heard)
            row("Voice", info.voice)
            row("Timings", info.timings.isEmpty ? nil : info.timings.sorted { $0.key < $1.key }.map { "\($0.key) \($0.value) ms" }.joined(separator: " · "))
            if let error = info.lastError { row("Error", error).foregroundStyle(Tokens.Colors.errorInk) }
        }
        .font(.caption.monospaced())
        .foregroundStyle(Tokens.Colors.ink)
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Tokens.Colors.card.opacity(0.92), in: RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
    }

    private func row(_ label: String, _ value: String?) -> Text {
        Text("\(Text("\(label):").bold()) \(value ?? "—")")
    }
}

/// Keeps the screen on while any conversation screen is open. Counted, since a
/// lesson swaps one conversation screen for the next and the old one's
/// onDisappear can come after the new one's onAppear.
@MainActor
enum KeepAwake {
    private static var holders = 0

    static func hold() {
        holders += 1
        update()
    }

    static func release() {
        holders = max(0, holders - 1)
        update()
    }

    private static func update() {
        #if canImport(UIKit)
        UIApplication.shared.isIdleTimerDisabled = holders > 0
        #endif
    }
}
