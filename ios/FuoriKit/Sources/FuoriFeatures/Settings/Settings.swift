import SwiftUI
import FuoriDesign
#if canImport(UIKit)
import UIKit
#endif

/// The learner's settings, kept on the phone for now (saved with the learner on
/// the server in M3 item 3). Changes apply at once; there's no Save.
public enum SettingsKey {
    public static let subtitles = "settings.subtitles"
    public static let english = "settings.english"
    /// Hidden since 2026-10-23 (Josh); hands-free is on for everyone since
    /// 2026-10-26, and a stored value is ignored (ConversationModel.tapMode)
    public static let handsFree = "settings.handsFree"
    /// Dialect allowed (Josh, 2026-10-23: a working control, wired up later):
    /// on for Advanced by default
    public static let dialect = "settings.dialect"

    /// The defaults that follow the level (Josh, 2026-10-23), set when the
    /// level is picked in the tour or changed in Settings; each can still be
    /// changed after. Beginner: the language's words and English. Intermediate:
    /// the words, no English. Advanced: neither, dialect on.
    public static func applyDefaults(forLevel level: String, to defaults: UserDefaults = .standard) {
        defaults.set(level != "advanced", forKey: subtitles)
        defaults.set(level == "beginner", forKey: english)
        defaults.set(level == "advanced", forKey: dialect)
    }
    /// Hidden (Settings → touch and hold Version): the debug panel on the
    /// person screen, the server and learner, and Restart onboarding, as the web's ?debug=1
    public static let debug = "settings.debug"
}

/// The settings button, top right on every screen (Josh, D2), with Fuori's
/// own icon (Josh, 2026-10-15), opening the settings sheet
struct SettingsToolbar: ViewModifier {
    @Environment(AppModel.self) private var model
    @State private var showing = false
    @State private var learning = false

    func body(content: Content) -> some View {
        content
            .toolbar {
                // The Learn area, next to Settings (docs/learn.md; Josh,
                // 2026-10-26); not during onboarding, which has nothing to learn yet
                if model.phase == .ready {
                    ToolbarItem(placement: .primaryAction) {
                        Button { NotificationCenter.default.post(name: .fuoriSheetOpening, object: nil); learning = true } label: {
                            Image(systemName: "character.book.closed")
                        }
                        .accessibilityLabel("Learn")
                        .accessibilityHint("Your conversations and what to learn from them")
                    }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button { NotificationCenter.default.post(name: .fuoriSheetOpening, object: nil); showing = true } label: {
                        SettingsIcon()
                    }
                    .accessibilityLabel("Settings")
                }
            }
            .sheet(isPresented: $learning) { LearnArea() }
            // A country picked in the sheet is applied only once it has closed
            .sheet(isPresented: $showing, onDismiss: { Task { await model.applyPendingCountry() } }) { SettingsSheet() }
            #if DEBUG
            // `-FuoriOpenSettings YES` opens Settings at launch, for simulator checks without tapping
            .onAppear { if UserDefaults.standard.bool(forKey: "FuoriOpenSettings") { showing = true } }
            // `-FuoriOpenLearn YES` opens the Learn area at launch
            .onAppear { if UserDefaults.standard.bool(forKey: "FuoriOpenLearn"), model.phase == .ready { learning = true } }
            #endif
    }
}

extension View {
    func settingsToolbar() -> some View { modifier(SettingsToolbar()) }
}

/// Settings (docs/onboarding-design.md → Ship first, Josh 2026-10-15): where
/// you're living, your level (greyed out until the M3 tier works), subtitles,
/// hands-free, dialect (greyed out), About. Every website setting carries
/// over; one that doesn't work yet shows greyed out with "Coming soon".
struct SettingsSheet: View {
    @Environment(AppModel.self) private var model
    @AppStorage(SettingsKey.subtitles) private var subtitles = true
    @AppStorage(SettingsKey.english) private var english = false
    @AppStorage(SettingsKey.dialect) private var dialect = false
    @AppStorage(SettingsKey.debug) private var debug = false
    @Environment(\.dismiss) private var dismiss
    @State private var confirmingRestart = false

    private enum Level: String, CaseIterable, Identifiable {
        case beginner = "Beginner", intermediate = "Intermediate", advanced = "Advanced"
        var id: String { rawValue }
        var note: String {
            switch self {
            case .beginner: "People speak slowly, keep it simple and show the English."
            case .intermediate: "Normal sentences, a little slower than natural. English only if you ask."
            case .advanced: "People talk to you as they would to anyone, at natural speed."
            }
        }
    }

    /// The level's selected segment in olive with white text (Josh,
    /// 2026-10-23: "make selection clearer"); iOS's default is a faint white.
    /// The only segmented control in the app, so the appearance is set here
    init() {
        #if canImport(UIKit)
        let control = UISegmentedControl.appearance()
        control.selectedSegmentTintColor = UIColor(Tokens.Colors.green)
        control.setTitleTextAttributes([.foregroundColor: UIColor.white, .font: UIFont.preferredFont(forTextStyle: .subheadline).bold()], for: .selected)
        control.setTitleTextAttributes([.foregroundColor: UIColor(Tokens.Colors.text)], for: .normal)
        #endif
    }

    private var currentLevel: Level {
        Level.allCases.first { $0.rawValue.lowercased() == model.level } ?? .beginner
    }

    private var levelBinding: Binding<Level> {
        Binding(get: { currentLevel }, set: { new in Task { await model.chooseLevel(new.rawValue.lowercased()) } })
    }

    private var version: String {
        let info = Bundle.main.infoDictionary
        return "\(info?["CFBundleShortVersionString"] as? String ?? "?") (\(info?["CFBundleVersion"] as? String ?? "?"))"
    }

    private var language: String { model.content?.language.name ?? "language" }
    private var appName: String { model.content?.language.appName ?? "the app" }

    var body: some View {
        NavigationStack {
            Form {
                if !model.countries.isEmpty {
                    Section {
                        HStack(alignment: .top, spacing: 12) {
                            ForEach(model.countries) { country in countryButton(country) }
                        }
                        .listRowInsets(EdgeInsets(top: 12, leading: 12, bottom: 12, trailing: 12))
                    } header: {
                        Text("Explore")
                    }
                }
                Section {
                    // Live (Josh, 2026-10-23): the level picked in the
                    // orientation tour, changed here; saved on the server
                    Picker("Your \(language)", selection: levelBinding) {
                        ForEach(Level.allCases) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .disabled(model.level == nil)
                } header: {
                    Text("Your \(language)")
                } footer: {
                    if let error = model.levelError {
                        Text(error).foregroundStyle(Tokens.Colors.errorInk)
                    } else {
                        Text(currentLevel.note)
                    }
                }
                // No masculine/feminine row (Josh, 2026-10-23: removed
                // entirely); it's chosen in the orientation tour
                Section {
                    Toggle("Show \(language) words", isOn: $subtitles)
                    Toggle("Show English translation", isOn: $english)
                    // A working switch, not wired into the conversation yet (Josh,
                    // 2026-10-23: "make it work as control… we will wire it up later")
                    Toggle("Allow dialect", isOn: $dialect)
                } header: {
                    Text("Subtitles")
                } footer: {
                    Text("Set for your level; change them any time.")
                }
                // Restart, below the subtitles (Josh, 2026-10-23): a new player
                // in this country, after a confirmation
                Section {
                    Button("Restart \(appName)", role: .destructive) { confirmingRestart = true }
                        .confirmationDialog("Restart \(appName)?", isPresented: $confirmingRestart, titleVisibility: .visible) {
                            Button("Restart", role: .destructive) {
                                dismiss()
                                Task { await model.restartGame() }
                            }
                            Button("Cancel", role: .cancel) {}
                        } message: {
                            Text("You'll start again as a new player: the tour, and nobody you've met will remember you. Other countries aren't affected.")
                        }
                } footer: {
                    Text("Start over from the beginning in \(model.content?.card?.country ?? appName).")
                }
                // No Hands-free switch: on for everyone (Josh, 2026-10-26), the
                // mic opens by itself and closes after 5 s of nothing said
                Section("About") {
                    Text("Everyone you meet in \(appName) is played by an AI.")
                    NavigationLink("Privacy") { PrivacyView(appName: appName) }
                    // Touch and hold for the developer rows (hidden, as the web's ?debug=1).
                    // They appear below, so nothing moves under the finger
                    LabeledContent("Version", value: version)
                        .contentShape(Rectangle())
                        .onLongPressGesture { debug.toggle() }
                        .sensoryFeedback(.selection, trigger: debug)
                    if debug {
                        Toggle("Debug panel", isOn: $debug)
                        LabeledContent("Server", value: model.server?.host() ?? "—")
                        LabeledContent("Learner", value: model.learnerId ?? "—")
                            .textSelection(.enabled)
                        // Back to the country choice, as on first launch (applied once the sheet has closed)
                        Button("Restart onboarding") {
                            model.pendingRestart = true
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDragIndicator(.visible)
        .presentationDetents([.large])
        // The other country's card, if the launch didn't get it
        .task { if model.countries.count < 2 { await model.loadCountries() } }
    }

    /// The current country is marked "You are in <country>"; tapping the other switches to it
    private func countryButton(_ country: AppModel.Country) -> some View {
        let here = country.server == model.server
        let name = country.content.card?.country ?? country.content.language.appName
        return Button {
            guard !here else { return }
            // Switch after the sheet has closed (SettingsToolbar's onDismiss)
            model.pendingCountry = country
            dismiss()
        } label: {
            VStack(spacing: 6) {
                CountryCardView(content: country.content, compact: true)
                    .overlay {
                        RoundedRectangle(cornerRadius: Tokens.Radius.card)
                            .strokeBorder(here ? Tokens.Colors.green : .clear, lineWidth: 3)
                    }
                // Josh, 2026-10-23: "You are in Italy" (the country from content)
                Text(here ? "You are in \(name)" : "Switch to \(name)")
                    .typeface(.label, Tokens.Size.badge, relativeTo: .footnote, weight: here ? .bold : .regular)
                    .foregroundStyle(here ? Tokens.Colors.green : Tokens.Colors.text)
            }
        }
        .buttonStyle(PressableStyle())
        .accessibilityLabel(here ? "\(country.content.card?.country ?? ""), where you are now" : "Switch to \(country.content.card?.country ?? "")")
        .accessibilityAddTraits(here ? .isSelected : [])
    }
}

/// What happens to what you say, in plain words (App Review also needs a
/// privacy policy URL before TestFlight beyond Josh: roadmap → Release)
private struct PrivacyView: View {
    let appName: String

    var body: some View {
        Form {
            Section {
                Text("The microphone is on only during your turn. What you say is sent to \(appName)'s server, which turns it into text (Groq), writes the replies of the people you talk with (Anthropic) and gives them their voices (ElevenLabs).")
                Text("Your conversations are saved, so the people you meet remember you. Recordings are not kept.")
                Text("There's no account: your progress belongs to this phone, separately in each country.")
            }
        }
        .navigationTitle("Privacy")
    }
}

#if canImport(UIKit)
private extension UIFont {
    func bold() -> UIFont { UIFont(descriptor: fontDescriptor.withSymbolicTraits(.traitBold) ?? fontDescriptor, size: 0) }
}
#endif

extension Notification.Name {
    /// Learn or Settings is opening over the screen: a live conversation pauses
    /// (in hands-free it kept listening behind the sheet and sent the
    /// flashcard words as a turn; scan, 2026-10-29). The bottom-bar Learn link
    /// already paused it
    static let fuoriSheetOpening = Notification.Name("fuori.sheetOpening")
}
