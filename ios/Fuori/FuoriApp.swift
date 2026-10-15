import SwiftUI
import FuoriFeatures
import FuoriNetworking

@main
struct FuoriApp: App {
    @State private var model: AppModel

    init() {
        // Pictures are immutable files on R2 (a new picture gets a new address),
        // so a large disk cache keeps the feeds fast and works with AsyncImage
        URLCache.shared = URLCache(memoryCapacity: 50_000_000, diskCapacity: 500_000_000)
        _model = State(initialValue: AppModel(api: APIClient(baseURL: Server.url, tokens: KeychainTokenStore())))
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
        }
    }
}

/// The server this build talks to: FuoriServer in Info.plist (FUORI_SERVER in
/// project.yml). A launch argument `-FuoriServer <url>` overrides it, e.g. to
/// try a local server from Xcode.
enum Server {
    static var url: URL {
        let value = UserDefaults.standard.string(forKey: "FuoriServer")
            ?? Bundle.main.object(forInfoDictionaryKey: "FuoriServer") as? String
        guard let value, let url = URL(string: value) else {
            fatalError("FuoriServer missing from Info.plist (set FUORI_SERVER in ios/project.yml)")
        }
        return url
    }
}
