import SwiftUI
import FuoriCore
import FuoriDesign

/// Loading, then the city list; a failure shows the server's message and a retry.
public struct RootView: View {
    @Environment(AppModel.self) private var model
    @State private var path = NavigationPath()

    public init() {}

    public var body: some View {
        NavigationStack(path: $path) {
            Group {
                switch model.phase {
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
                case .ready:
                    if let content = model.content {
                        CityListView(content: content)
                            .navigationDestination(for: City.self) { city in
                                PlaceListView(city: city, content: content)
                            }
                            .navigationDestination(for: PersonRoute.self) { route in
                                if let person = content.character(route.place.characterId) {
                                    PersonView(city: route.city, place: route.place, character: person)
                                }
                            }
                    }
                }
            }
        }
        .tint(Tokens.Colors.green)
        .task {
            if model.content == nil { await model.load() }
            openFromLaunchArgument()
        }
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
