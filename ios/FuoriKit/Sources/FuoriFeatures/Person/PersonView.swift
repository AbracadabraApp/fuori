import SwiftUI
import FuoriCore
import FuoriDesign

/// The person screen (Josh's approved "name on a band", 2026-10-13, in iOS
/// form; docs/13-ios-conventions.md R2, R14): the standard navigation bar with
/// the back button and the settings button, a paper band with the name and
/// "Role, neighbourhood", then the portrait running to the bottom edge, with
/// the subtitles and the conversation controls over its lower part. Nothing
/// scrolls, so the portrait never slides away. Opening the screen starts the
/// conversation (hands-free); leaving it saves.
struct PersonView: View {
    @State private var model: ConversationModel
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage(SettingsKey.subtitles) private var subtitles = true
    @AppStorage(SettingsKey.english) private var english = false
    @AppStorage(SettingsKey.debug) private var debug = false
    @State private var showingLearn = false

    init(model: ConversationModel) {
        _model = State(initialValue: model)
    }

    var body: some View {
        VStack(spacing: 0) {
            band
            ZStack(alignment: .bottom) {
                Portrait(url: model.character.portrait, name: model.character.name)
                    .ignoresSafeArea(edges: .bottom)
                if debug {
                    DebugPanel(info: model.debug, conversationId: model.conversationId)
                        .frame(maxHeight: .infinity, alignment: .top)
                        .padding(.horizontal, Tokens.Space.gutter)
                        .padding(.top, 8)
                }
                VStack(spacing: 8) {
                    // While scaffolding: the words and the English always
                    // (docs/beginner-scaffolding.md)
                    let showLine = model.scaffolding || subtitles
                    let showEnglish = model.scaffolding || english
                    Subtitles(line: showLine ? model.line : nil, shown: model.shown, english: showEnglish ? model.english : nil, note: note)
                    ConversationControls(model: model, onLearn: openLearn)
                }
                .padding(.horizontal, Tokens.Space.gutter)
            }
        }
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
        // Every way out (back button, edge swipe) saves through leave()
        .onDisappear { model.leave() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background { model.backgrounded() }
        }
    }

    /// The Learn link: pause the scene, then the Learn sheet over it
    private func openLearn() {
        model.openLearn()
        showingLearn = true
    }

    /// The note above the controls: what went wrong, or a hint like "Didn't catch that."
    private var note: String? {
        switch model.phase {
        case .failed(let message): message
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

/// The 2:3 portrait, anchored at the top, always at least 124% of the screen
/// width (Josh, 2026-10-13: the same framing on every phone), so the sides are
/// trimmed alike and a short phone loses a little at the bottom instead.
private struct Portrait: View {
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
