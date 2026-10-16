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
        _model = State(initialValue: AppModel(servers: Server.countries, fixedServer: Server.launchArgument) { url in
            // One token per server, so each country has its own learner
            APIClient(baseURL: url, tokens: KeychainTokenStore(server: url.host() ?? url.absoluteString))
        })
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
        }
    }
}

/// The countries' servers: FuoriCountryServers in Info.plist (project.yml).
/// The learner picks one on first launch; `-FuoriServer <url>` as a launch
/// argument skips the choice, e.g. to try a local server from Xcode.
enum Server {
    static var countries: [URL] {
        let list = Bundle.main.object(forInfoDictionaryKey: "FuoriCountryServers") as? [String] ?? []
        let urls = list.compactMap(URL.init(string:))
        precondition(!urls.isEmpty, "FuoriCountryServers missing from Info.plist (ios/project.yml)")
        return urls
    }

    /// `-FuoriServer <url>` from the launch arguments; never saved
    static var launchArgument: URL? {
        let args = ProcessInfo.processInfo.arguments
        guard let i = args.firstIndex(of: "-FuoriServer"), i + 1 < args.count else { return nil }
        return URL(string: args[i + 1])
    }
}
