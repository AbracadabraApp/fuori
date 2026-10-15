import AVFoundation

/// The phone's audio setup for a conversation: play and record, through the
/// speaker (not the earpiece) or headphones, AirPods' microphone allowed.
/// On while a conversation screen is open, off when it closes.
public enum AudioSession {
    public static func activate() throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP, .allowBluetoothA2DP])
        try session.setActive(true)
        #endif
    }

    public static func deactivate() {
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        #endif
    }

    /// Asks for the microphone the first time; true when allowed
    public static func requestMicrophone() async -> Bool {
        #if os(iOS)
        await AVAudioApplication.requestRecordPermission()
        #else
        true
        #endif
    }
}
