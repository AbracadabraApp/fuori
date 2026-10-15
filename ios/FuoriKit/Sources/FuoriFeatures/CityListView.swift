import SwiftUI
import FuoriCore
import FuoriDesign

/// The first screen: the cities as Polaroid cards, first-screen cities and
/// then the rest after "show more" (the web's city list, app/page.tsx).
struct CityListView: View {
    let content: Content
    @State private var showAll = false

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Tokens.Space.cardGap) {
                ForEach(showAll ? content.cities : content.firstScreenCities) { city in
                    NavigationLink(value: city) {
                        PolaroidCard(image: city.image, title: city.name, subtitle: city.region)
                    }
                    .buttonStyle(.plain)
                }
                if !showAll && !content.moreCities.isEmpty {
                    Button(content.language.ui.showMore) { showAll = true }
                        .font(.label(Tokens.Size.body, weight: .medium))
                        .foregroundStyle(Tokens.Colors.green)
                        .padding(.vertical, Tokens.Space.gutter)
                }
            }
            .padding(Tokens.Space.gutter)
        }
        .background(Tokens.Colors.paper)
        .navigationTitle(content.language.appName)
        .navigationDestination(for: City.self) { city in
            PlaceListView(city: city, content: content)
        }
    }
}
