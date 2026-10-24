import SwiftUI
import FuoriCore
import FuoriDesign

/// Loading, then the city list; a failure shows the server's message and a
/// retry, and a build the server no longer accepts asks for an update.
public struct RootView: View {
    @Environment(AppModel.self) private var model
    @State private var path = NavigationPath()
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    /// The launch picture, shared by the launch view and the country choice
    @Namespace private var art
    /// The opening moment has been held for its minimum
    @State private var launchHeld = false
    /// The learner tapped to skip the opening moment
    @State private var launchSkipped = false
    /// A country has been picked this launch (the choice shows at every launch)
    @State private var countryPicked = false

    public init() {}

    public var body: some View {
        ZStack {
            app
            if showsChoiceAtLaunch {
                CountryChoiceView(art: art) { countryPicked = true }
                    .transition(.opacity)
                    .zIndex(1)
            }
            if showsLaunch {
                LaunchView(art: art)
                    .transition(.opacity)
                    .onTapGesture { if canSkipLaunch { launchSkipped = true } }
                    .zIndex(1)
            }
        }
        .animation(reduceMotion ? .linear(duration: 0.25) : .easeInOut(duration: 0.45), value: showsLaunch)
        .animation(reduceMotion ? .linear(duration: 0.25) : .easeInOut(duration: 0.45), value: showsChoiceAtLaunch)
        .task {
            // The opening moment holds about a second (canvas "Launch screen")
            try? await Task.sleep(for: .seconds(1))
            launchHeld = true
        }
    }

    /// Paper and the picture: at least a second, longer while the country
    /// loads; a tap skips the rest once there's something to show. On first
    /// launch it gives way to the country choice, the picture moving up.
    private var showsLaunch: Bool {
        if case .choosingCountry = model.phase { return model.countries.isEmpty }
        // Every launch: the picture until the countries are in, then the choice
        if asksCountry { return model.countries.isEmpty }
        if model.phase == .loading { return true }
        return !launchHeld && !launchSkipped
    }

    /// The choice at every launch (not the first, which has its own; not
    /// with a server set from outside, or a place opened by launch argument)
    private var asksCountry: Bool {
        guard !countryPicked, !model.serverIsFixed else { return false }
        if case .choosingCountry = model.phase { return false }
        #if DEBUG
        if UserDefaults.standard.string(forKey: "FuoriOpen") != nil { return false }
        #endif
        return true
    }

    private var showsChoiceAtLaunch: Bool { asksCountry && !model.countries.isEmpty }

    private var canSkipLaunch: Bool {
        model.phase != .loading && model.phase != .choosingCountry
    }

    private var app: some View {
        NavigationStack(path: $path) {
            Group {
                switch model.phase {
                case .choosingCountry:
                    // Until the countries are in, the launch view covers this
                    if model.countries.isEmpty {
                        Tokens.Colors.paper.ignoresSafeArea()
                    } else {
                        CountryChoiceView(art: art)
                            #if os(iOS)
                            .toolbar(.hidden, for: .navigationBar)
                            #endif
                    }
                case .loading:
                    // Covered by the launch view
                    Tokens.Colors.paper.ignoresSafeArea()
                case .failed(let message):
                    ContentUnavailableView {
                        Label("Can't reach the server", systemImage: "wifi.exclamationmark")
                    } description: {
                        Text(message)
                    } actions: {
                        Button("Try Again") { Task { await model.load() } }
                            .buttonStyle(.borderedProminent)
                    }
                    .background(Tokens.Colors.paper)
                case .tooOld(let message):
                    // No retry: trying again can't help until the app is updated
                    ContentUnavailableView {
                        Label("Update the app", systemImage: "arrow.down.app")
                    } description: {
                        Text(message)
                    }
                    .background(Tokens.Colors.paper)
                case .onboarding:
                    if let onboarding = model.onboarding {
                        OnboardingView(model: onboarding)
                    }
                case .ready:
                    if let content = model.content {
                        CityListView(content: content)
                            .navigationDestination(for: City.self) { city in
                                PlaceListView(city: city, content: content)
                            }
                            .navigationDestination(for: PersonRoute.self) { route in
                                if let person = content.character(route.place.characterId),
                                   let conversation = model.conversation(city: route.city, place: route.place, character: person) {
                                    PersonView(model: conversation)
                                }
                            }
                    }
                }
            }
        }
        .tint(Tokens.Colors.green)
        .task {
            if model.content == nil { await model.start() }
            openFromLaunchArgument()
        }
        // A new country (Settings → Explore) starts at its city list
        .onChange(of: model.server) { path = NavigationPath() }
    }

    /// Debug builds only: `-FuoriOpen <cityId>/<placeId>` opens that place at
    /// launch, for screenshots and simulator checks without tapping.
    private func openFromLaunchArgument() {
        #if DEBUG
        guard let target = UserDefaults.standard.string(forKey: "FuoriOpen"),
              let content = model.content else { return }
        let parts = target.split(separator: "/").map(String.init)
        guard let city = content.city(parts[0]) else { return }
        path.append(city)
        if parts.count > 1, let place = city.places.first(where: { $0.id == parts[1] }) {
            path.append(PersonRoute(city: city, place: place))
        }
        #endif
    }
}
