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

    init(model: ConversationModel) {
        _model = State(initialValue: model)
    }

    var body: some View {
        VStack(spacing: 0) {
            band
            ZStack(alignment: .bottom) {
                Portrait(url: model.character.portrait, name: model.character.name)
                    .ignoresSafeArea(edges: .bottom)
                VStack(spacing: 8) {
                    Subtitles(line: subtitles ? model.line : nil, shown: model.shown, english: english ? model.english : nil, note: note)
                    ConversationControls(model: model)
                }
                .padding(.horizontal, Tokens.Space.gutter)
            }
        }
        .background(Tokens.Colors.paper)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.paper, for: .navigationBar)
        #endif
        .settingsToolbar()
        .task { await model.start() }
        // Every way out (back button, edge swipe) saves through leave()
        .onDisappear { model.leave() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background { model.backgrounded() }
        }
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
