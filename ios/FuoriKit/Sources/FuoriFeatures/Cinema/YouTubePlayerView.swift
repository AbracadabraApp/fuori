import SwiftUI

#if canImport(YouTubeiOSPlayerHelper)
import YouTubeiOSPlayerHelper

/// YouTube's embedded player (youtube-ios-player-helper), as in MovieGenius:
/// plays inline and starts by itself; a new id loads the new video
struct YouTubePlayerView: UIViewRepresentable {
    let videoId: String
    var onReady: () -> Void = {}
    var onError: (String) -> Void = { _ in }

    func makeCoordinator() -> Coordinator { Coordinator(onReady: onReady, onError: onError) }

    func makeUIView(context: Context) -> YTPlayerView {
        let player = YTPlayerView()
        player.delegate = context.coordinator
        return player
    }

    func updateUIView(_ player: YTPlayerView, context: Context) {
        guard context.coordinator.loaded != videoId else { return }
        context.coordinator.loaded = videoId
        player.load(withVideoId: videoId, playerVars: ["playsinline": 1, "autoplay": 1, "rel": 0, "fs": 1])
    }

    final class Coordinator: NSObject, YTPlayerViewDelegate {
        let onReady: () -> Void
        let onError: (String) -> Void
        var loaded: String?

        init(onReady: @escaping () -> Void, onError: @escaping (String) -> Void) {
            self.onReady = onReady
            self.onError = onError
        }

        func playerViewDidBecomeReady(_ playerView: YTPlayerView) { onReady() }

        func playerView(_ playerView: YTPlayerView, receivedError error: YTPlayerError) {
            switch error {
            case .notEmbeddable: onError("This video can't be played here.")
            case .videoNotFound: onError("This video isn't on YouTube any more.")
            default: onError("The video didn't load.")
            }
        }
    }
}
#else
/// macOS (the package tests): no player
struct YouTubePlayerView: View {
    let videoId: String
    var onReady: () -> Void = {}
    var onError: (String) -> Void = { _ in }
    var body: some View { Color.black }
}
#endif
