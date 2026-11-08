#if os(iOS)
import UIKit

/// Which way the app may turn (Josh, 2026-11-08: "Can tilt go full screen").
/// The app is portrait everywhere except the trailer screen, which allows
/// landscape while it's open. The app delegate (Fuori/FuoriApp.swift) asks
/// `mask`; Info.plist lists all three orientations so iOS will rotate at all.
@MainActor
public enum OrientationLock {
    public private(set) static var mask: UIInterfaceOrientationMask = .portrait

    static func allow(_ newMask: UIInterfaceOrientationMask) {
        mask = newMask
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        for scene in scenes {
            scene.keyWindow?.rootViewController?.setNeedsUpdateOfSupportedInterfaceOrientations()
            // Leaving the trailer while sideways turns the app back upright
            if newMask == .portrait { scene.requestGeometryUpdate(.iOS(interfaceOrientations: .portrait)) }
        }
    }
}
#endif
