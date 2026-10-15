import SwiftUI
import FuoriDesign

/// The learner's settings, kept on the phone for now (saved with the learner on
/// the server in M3 item 3). Changes apply at once; there's no Save.
public enum SettingsKey {
    public static let subtitles = "settings.subtitles"
    public static let english = "settings.english"
    public static let moreTime = "settings.moreTime"
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
    @Environment(\.dismiss) private var dismiss

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
                    Toggle("More time to answer", isOn: $moreTime)
                } footer: {
                    Text("Waits longer for you to start and to finish speaking before it's the other person's turn.")
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
