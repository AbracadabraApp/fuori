import SwiftUI
import FuoriCore
import FuoriDesign

/// The first screen: every city as a Polaroid card, the first-screen cities
/// on top in the curated order (Josh, D4: no "show more" on this list).
struct CityListView: View {
    let content: Content
    @Environment(AppModel.self) private var model

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Tokens.Space.cardGap) {
                ForEach(content.firstScreenCities + content.moreCities) { city in
                    NavigationLink(value: city) {
                        PolaroidCard(image: city.image, title: city.name, subtitle: city.region)
                            .overlay(alignment: .topTrailing) { visitBadge(city) }
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

    /// A ticket stub in the picture's corner after the first conversation
    /// anywhere in the city; cities have one stage (Josh, 2026-10-29)
    @ViewBuilder private func visitBadge(_ city: City) -> some View {
        if let words = content.language.ui.stamp, city.places.contains(where: { (model.visits[$0.id] ?? 0) > 0 }) {
            VisitStamp(paper: .ticket, stage: .visited, word: words.visited, label: words.visitedLabel, seed: city.id)
                .padding(10)
        }
    }
}
