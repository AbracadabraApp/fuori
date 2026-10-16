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
    /// The server chosen in the debug section; read at launch (FuoriApp's Server)
    public static let server = "FuoriServer"
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
    }
}

extension View {
    func settingsToolbar() -> some View { modifier(SettingsToolbar()) }
}

struct SettingsSheet: View {
    @AppStorage(SettingsKey.subtitles) private var subtitles = true
    @AppStorage(SettingsKey.english) private var english = false
    @AppStorage(SettingsKey.moreTime) private var moreTime = false
    @AppStorage(SettingsKey.handsFree) private var handsFree = false
    @AppStorage(SettingsKey.debug) private var debug = false
    @AppStorage(SettingsKey.server) private var server = ""
    @State private var versionTaps = 0
    @Environment(\.dismiss) private var dismiss

    private var version: String {
        let info = Bundle.main.infoDictionary
        return "\(info?["CFBundleShortVersionString"] as? String ?? "?") (\(info?["CFBundleVersion"] as? String ?? "?"))"
    }

    /// The countries' servers from Info.plist (FuoriServers), e.g. Italy, Mexico
    private var servers: [(name: String, url: String)] {
        let dict = Bundle.main.object(forInfoDictionaryKey: "FuoriServers") as? [String: String] ?? [:]
        return dict.sorted { $0.key < $1.key }.map { ($0.key, $0.value) }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Subtitles", isOn: $subtitles)
                    Toggle("English translation", isOn: $english)
                } footer: {
                    Text("What people say, written under them, and its English.")
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
                if debug {
                    Section {
                        Picker("Server", selection: $server) {
                            Text("This build's").tag("")
                            ForEach(servers, id: \.url) { Text($0.name).tag($0.url) }
                        }
                        Toggle("Debug panel", isOn: $debug)
                    } header: {
                        Text("Developer")
                    } footer: {
                        Text("A new server takes effect the next time the app opens. Each server keeps its own learner.")
                    }
                }
                Section {
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
    }
}
