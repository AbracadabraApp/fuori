import SwiftUI
import FuoriCore
import FuoriDesign

/// The first screen: every city as a Polaroid card, the first-screen cities
/// on top in the curated order (Josh, D4: no "show more" on this list).
struct CityListView: View {
    let content: Content

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Tokens.Space.cardGap) {
                ForEach(content.firstScreenCities + content.moreCities) { city in
                    NavigationLink(value: city) {
                        PolaroidCard(image: city.image, title: city.name, subtitle: city.region)
                    }
                    .buttonStyle(PressableStyle())
                }
            }
            .padding(Tokens.Space.gutter)
        }
        .background(Tokens.Colors.paper)
        .navigationTitle(content.language.appName)
        .settingsToolbar()
    }
}
