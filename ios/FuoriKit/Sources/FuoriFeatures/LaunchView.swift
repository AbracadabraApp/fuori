import SwiftUI
import FuoriDesign

/// The opening moment (Josh, 2026-10-22: "a strong intro"; canvas "Launch
/// screen", board 1): paper and the launch picture, nothing else. It's what
/// the system launch screen shows (UILaunchScreen in project.yml: the
/// LaunchBackground colour and the LaunchArt image, the app icon's art rounded
/// with its shadow), drawn the same size in the same place, so the app opens
/// with no jump. RootView holds it for about a second, longer while the
/// country loads, then fades to the app; on first launch the picture moves up
/// and the country choice appears under it.
struct LaunchView: View {
    let art: Namespace.ID

    var body: some View {
        ZStack {
            Tokens.Colors.paper
            LaunchArt(art: art)
        }
        .ignoresSafeArea()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Loading")
    }
}

/// The launch picture at its own size (390 pt square, the art 342 pt inside
/// with room for its shadow), shared between the launch view and the choice
struct LaunchArt: View {
    let art: Namespace.ID

    var body: some View {
        Image("LaunchArt", bundle: .main)
            .matchedGeometryEffect(id: "launch-art", in: art)
            .accessibilityHidden(true)
    }
}
