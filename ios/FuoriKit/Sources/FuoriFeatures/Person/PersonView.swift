import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking
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
    /// Learn 2.0: the card on the sheet after the goodbye (docs/learn-sheet-2-design.md)
    @State private var learnCard: APIClient.LearnCard?
    @Environment(AppModel.self) private var appModel
    @Environment(\.dismiss) private var dismiss

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
                    DebugPanel(info: model.debug, conversationId: model.conversationId) { rating, note in model.rate(rating, note: note) }
                        .frame(maxHeight: .infinity, alignment: .top)
                        .padding(.horizontal, Tokens.Space.gutter)
                        .padding(.top, 8)
                }
                // Over the portrait; when it doesn't fit (the largest text
                // sizes), it scrolls from the bottom, and the portrait stays put
                ViewThatFits(in: .vertical) {
                    overlay
                    ScrollView { overlay }
                        .defaultScrollAnchor(.bottom)
                        .scrollIndicators(.hidden)
                }
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
        // Every way out of the card (close, slide down, a tap off it) goes back to the place list
        .sheet(item: $learnCard, onDismiss: {
            model.learnCardClosed()
            dismiss()
        }) { card in
            LearnCardSheet(card: card, speechLanguage: model.speechLanguage)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
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
        // Learn 2.0: the visit is saved at the goodbye, and its card, if the server has one ready in the
        // same 1.5 s, slides up over this screen; otherwise back to the place as before
        .onChange(of: model.phase) { _, phase in
            guard phase == .finished, model.endButton == nil else { return }
            model.saveAtGoodbye()
            Task {
                async let card = model.learnCard()
                try? await Task.sleep(for: .seconds(1.5))
                if let ready = await card { learnCard = ready } else { dismiss() }
            }
        }
    }

    /// The bubbles or subtitles and the controls
    private var overlay: some View {
        VStack(spacing: 8) {
            // While scaffolding: the words and the English always
            // (docs/beginner-scaffolding.md)
            let showLine = model.scaffolding || subtitles
            // A Beginner 2 question always shows its English (Josh, 2026-11-11: "only the Spanish question and translation")
            let showEnglish = model.scaffolding || english || model.question != nil
            // Beginner dialogue: her English is heard, her words in the language are bubbles. Parts that are only
            // the answers to say back (Beginner 2 on the one-line reply, 2026-11-11): her line is the subtitle as
            // at every other level, and the answers show on the learner's turn (ConversationControls)
            if model.parts?.contains(where: { !$0.isAnswer }) == true {
                BeginnerBubbles(parts: model.shownParts, speechLanguage: model.speechLanguage)
                if let note { Subtitles(line: nil, shown: nil, english: nil, note: note) }
            } else {
                Subtitles(line: showLine ? model.chatLine : nil, shown: model.chatShown, english: showEnglish ? model.chatEnglish : nil, note: note, hint: model.openerHint, speechLanguage: model.speechLanguage)
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

/// The hidden debug panel (Settings → Developer): what is playing and how to
/// say what you think of it (Josh, 2026-11-15: "instrument the debug panel -
/// useless now"; "rate turns"; "report bugs"). First the turn as the server
/// played it (level and step, the turn type, where the visit is, the mix, the
/// count toward the level up), then three buttons that rate the turn showing,
/// saved with those facts (/v1/rate); then what was heard, the voice, timings
/// and the last error, as before. English, since it's a developer's tool
private struct DebugPanel: View {
    let info: ConversationModel.DebugInfo
    let conversationId: String?
    let rate: (_ rating: String, _ note: String?) -> Void

    @State private var askingBug = false
    @State private var bugNote = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            row("Playing", playing)
            row("Mix", mix)
            row("Level up", info.levelUp.map { "\($0.counted) of \($0.after) visits" })
            HStack(spacing: 8) {
                rateButton("Good", "good")
                rateButton("Bad", "bad")
                Button("Bug…") { askingBug = true }
                    .buttonStyle(.bordered)
                    .disabled(info.turn == nil || conversationId == nil)
                if let rated = info.rated { Text(rated == "not sent" ? "not sent" : "sent: \(rated)").bold() }
            }
            .controlSize(.small)
            .padding(.vertical, 2)
            row("Heard", info.heard)
            row("Voice", info.voice)
            row("Timings", info.timings.isEmpty ? nil : info.timings.sorted { $0.key < $1.key }.map { "\($0.key) \($0.value) ms" }.joined(separator: " · "))
            row("Prompt", info.promptVersion)
            row("Saved", conversationId.map { "yes (\(String($0.prefix(8))))" } ?? "no")
            if let error = info.lastError { row("Error", error).foregroundStyle(Tokens.Colors.errorInk) }
        }
        .font(.caption.monospaced())
        .foregroundStyle(Tokens.Colors.ink)
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Tokens.Colors.card.opacity(0.92), in: RoundedRectangle(cornerRadius: 8))
        .alert("What's wrong with this turn?", isPresented: $askingBug) {
            TextField("A few words (optional)", text: $bugNote)
            Button("Send") {
                rate("bug", bugNote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : bugNote)
                bugNote = ""
            }
            Button("Cancel", role: .cancel) { bugNote = "" }
        }
    }

    /// "Beginner step 2 · turn 4 of 9 · comment · help asked"
    private var playing: String? {
        guard let t = info.turn else { return nil }
        var parts = [t.step.map { "\(t.level.capitalizingFirstLetter) step \($0)" } ?? t.level.capitalizingFirstLetter]
        parts.append(t.closeAt.map { "turn \(t.turn) of \($0)" } ?? "turn \(t.turn)")
        if let setup = t.setup { parts.append(setup) }
        if let shape = t.shape { parts.append(shape) }
        if t.help == true { parts.append("help asked") }
        return parts.joined(separator: " · ")
    }

    /// "41% in the language this turn · 38% this visit"
    private var mix: String? {
        guard let t = info.turn, let share = t.share else { return nil }
        return "\(share)% in the language this turn" + (t.visitShare.map { " · \($0)% this visit" } ?? "")
    }

    private func rateButton(_ label: String, _ rating: String) -> some View {
        Button(label) { rate(rating, nil) }
            .buttonStyle(.bordered)
            .disabled(info.turn == nil || conversationId == nil)
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
