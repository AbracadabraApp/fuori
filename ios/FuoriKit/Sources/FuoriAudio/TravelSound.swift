import Foundation
#if canImport(AudioToolbox)
import AudioToolbox
#endif

/// The sound of the trip on the ticket-and-map page: a train on rails, a bus
/// on the road (Josh, 2026-11-16). Played as a system sound, not through the
/// conversation's audio session, so it follows the ring/silent switch and
/// never takes audio over from the learner's music: the reason
/// docs/13-ios-conventions.md had for allowing no sound effects at all.
public enum TravelSound {
    #if canImport(AudioToolbox)
    @MainActor private static var loaded: [String: SystemSoundID] = [:]
    #endif

    /// Plays the bundled sound of that name once; nothing happens for a name
    /// the app doesn't carry (a newer server's sound on an older build)
    @MainActor public static func play(_ name: String?) {
        #if canImport(AudioToolbox)
        guard let name, !name.isEmpty else { return }
        if let id = loaded[name] {
            AudioServicesPlaySystemSound(id)
            return
        }
        guard let url = Bundle.module.url(forResource: name, withExtension: "wav") else { return }
        var id: SystemSoundID = 0
        guard AudioServicesCreateSystemSoundID(url as CFURL, &id) == kAudioServicesNoError else { return }
        loaded[name] = id
        AudioServicesPlaySystemSound(id)
        #endif
    }

    /// Ends whatever is playing (the learner cancelled the trip)
    @MainActor public static func stop() {
        #if canImport(AudioToolbox)
        for id in loaded.values { AudioServicesDisposeSystemSoundID(id) }
        loaded = [:]
        #endif
    }

    /// Whether the app carries a sound of that name
    public static func has(_ name: String) -> Bool {
        Bundle.module.url(forResource: name, withExtension: "wav") != nil
    }
}
