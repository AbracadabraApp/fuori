import Foundation
import Testing
@testable import FuoriAudio
@testable import FuoriNetworking

/// A line can't wait forever (Josh, 2026-10-29: onboarding froze on its
/// first screen): playback ends after its own length plus a margin, and the
/// character's voice is given up on well before the system's 60 s.
@Suite struct VoiceDeadlineTests {
    @Test func recordedLineEndsSoonAfterItsLength() {
        #expect(Voice.playDeadline(duration: 4) == 7)
        #expect(Voice.playDeadline(duration: -1) == 3)
    }

    @Test func phonesVoiceGetsTimeForTheLineButNotForever() {
        // "Ciao! Benvenuti a Fuori." at the app's usual 0.9: a few seconds
        let short = Voice.speakDeadline(characters: 25, rate: 0.9)
        #expect(short >= 7 && short <= 10)
        // A long card (300 characters) slowly still gets well over its spoken length
        let long = Voice.speakDeadline(characters: 300, rate: 0.5)
        #expect(long > 300.0 / 6.0 && long < 120)
    }

    @Test func characterVoiceGivesUpWellBeforeTheSystemDefault() {
        #expect(APIClient.speakTimeout <= 15)
    }
}
