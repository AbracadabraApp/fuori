import SwiftUI
import FuoriDesign

/// The learner's settings, kept on the phone for now (saved with the learner on
/// the server in M3 item 3). Changes apply at once; there's no Save.
public enum SettingsKey {
    public static let subtitles = "settings.subtitles"
    public static let english = "settings.english"
    public static let moreTime = "settings.moreTime"
    /// Off (default, Josh 2026-10-15): tap to talk, tap again when done.
    /// On: the mic opens by itself after the character and closes after a silence.
    public static let handsFree = "settings.handsFree"
    /// Hidden (Settings → tap the version five times): the debug panel on the
    /// person screen and the server choice, as the web's ?debug=1
    public static let debug = "settings.debug"
}

/// The settings button, top right on every screen (Josh, D2), with Fuori's
/// own icon (Josh, 2026-10-15), opening the settings sheet
struct SettingsToolbar: ViewModifier {
    @State private var showing = false

    func body(content: Content) -> some View {
        content
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showing = true } label: {
                        SettingsIcon()
                    }
                    .accessibilityLabel("Settings")
                }
            }
            .sheet(isPresented: $showing) { SettingsSheet() }
            #if DEBUG
            // `-FuoriOpenSettings YES` opens Settings at launch, for simulator checks without tapping
            .onAppear { if UserDefaults.standard.bool(forKey: "FuoriOpenSettings") { showing = true } }
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
    @AppStorage(SettingsKey.moreTime) private var moreTime = false
    @AppStorage(SettingsKey.handsFree) private var handsFree = false
    @AppStorage(SettingsKey.debug) private var debug = false
    @State private var versionTaps = 0
    @Environment(\.dismiss) private var dismiss

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
                        Text("Where you're living")
                    } footer: {
                        Text("Your progress and the people you've met are kept in each country.")
                    }
                }
                Section {
                    // Greyed out until the level changes how people talk (M3; Josh, 2026-10-15)
                    Picker("Your \(language)", selection: .constant(Level.beginner)) {
                        ForEach(Level.allCases) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .disabled(true)
                } header: {
                    Text("Your \(language)")
                } footer: {
                    Text("Coming soon. \(Level.beginner.note)")
                }
                Section {
                    Toggle("Show \(language) words", isOn: $subtitles)
                    Toggle("Show English translation", isOn: $english)
                    // As on the website; does nothing yet (dialect grows with level, docs/02-game-design.md)
                    Toggle("Allow dialect", isOn: .constant(false))
                        .disabled(true)
                } header: {
                    Text("Subtitles")
                } footer: {
                    Text("Allow dialect: coming soon.")
                }
                Section {
                    Toggle("Hands-free", isOn: $handsFree)
                    if handsFree {
                        Toggle("More time to answer", isOn: $moreTime)
                    }
                } footer: {
                    Text(handsFree
                         ? "The microphone opens by itself when it's your turn and closes after a pause. More time to answer waits longer before your turn ends."
                         : "Tap to talk, and tap again when you've finished.")
                }
                Section("About") {
                    Text("Everyone you meet in \(appName) is played by an AI.")
                    NavigationLink("Privacy") { PrivacyView(appName: appName) }
                    // Five taps turn the developer section on (hidden, as the web's ?debug=1)
                    Button {
                        versionTaps += 1
                        if versionTaps >= 5 { debug.toggle(); versionTaps = 0 }
                    } label: {
                        LabeledContent("Version", value: version)
                    }
                    .buttonStyle(.plain)
                    .sensoryFeedback(.selection, trigger: debug)
                }
                if debug {
                    Section {
                        Toggle("Debug panel", isOn: $debug)
                    } header: {
                        Text("Developer")
                    } footer: {
                        Text("Shows the prompt version, what was heard, the voice and timings on the person screen.")
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

    /// The current country is marked "You're here"; tapping the other switches to it
    private func countryButton(_ country: AppModel.Country) -> some View {
        let here = country.server == model.server
        return Button {
            guard !here else { return }
            dismiss()
            Task { await model.choose(country) }
        } label: {
            VStack(spacing: 6) {
                CountryCardView(content: country.content, compact: true)
                    .overlay {
                        RoundedRectangle(cornerRadius: Tokens.Radius.card)
                            .strokeBorder(here ? Tokens.Colors.green : .clear, lineWidth: 3)
                    }
                Text(here ? "You're here" : "Switch to \(country.content.card?.country ?? country.content.language.appName)")
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
