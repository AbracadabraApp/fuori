import SwiftUI
import FuoriCore
import FuoriDesign

/// Loading, then the city list; a failure shows the server's message and a
/// retry, and a build the server no longer accepts asks for an update.
public struct RootView: View {
    @Environment(AppModel.self) private var model
    @State private var path = NavigationPath()

    public init() {}

    public var body: some View {
        NavigationStack(path: $path) {
            Group {
                switch model.phase {
                case .choosingCountry:
                    if model.countries.isEmpty {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .background(Tokens.Colors.paper)
                    } else {
                        CountryChoiceView()
                    }
                case .loading:
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Tokens.Colors.paper)
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
