import Foundation
import Testing
@testable import FuoriFeatures

/// The settings that follow the level (Josh, 2026-10-23): Beginner, the
/// language's words and English; Intermediate, the words only; Advanced,
/// neither, with dialect on
@Suite struct LevelDefaultsTests {
    private func applied(_ level: String) -> (words: Bool, english: Bool, dialect: Bool) {
        let defaults = UserDefaults(suiteName: "LevelDefaultsTests.\(level)")!
        SettingsKey.applyDefaults(forLevel: level, to: defaults)
        return (defaults.bool(forKey: SettingsKey.subtitles), defaults.bool(forKey: SettingsKey.english), defaults.bool(forKey: SettingsKey.dialect))
    }

    @Test func beginner() { #expect(applied("beginner") == (true, true, false)) }
    @Test func intermediate() { #expect(applied("intermediate") == (true, false, false)) }
    @Test func advanced() { #expect(applied("advanced") == (false, false, true)) }
}
