import SwiftUI
import FuoriCore
import FuoriDesign

/// A city's places in the server's feed order, each with who you meet there.
/// Conversations come in N1 (docs/12-native-app.md); until then the cards
/// are for looking.
struct PlaceListView: View {
    let city: City
    let content: Content
    @Environment(AppModel.self) private var model

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Tokens.Space.cardGap) {
                ForEach(city.places) { place in
                    PolaroidCard(image: place.image, title: place.name, subtitle: subtitle(place))
                        .overlay(alignment: .topTrailing) { visitBadge(place) }
                }
            }
            .padding(Tokens.Space.gutter)
        }
        .background(Tokens.Colors.paper)
        .navigationTitle(city.name)
    }

    private func subtitle(_ place: Place) -> String {
        guard let person = content.character(place.characterId) else { return place.neighbourhood }
        return "\(person.name), \(person.role) · \(place.neighbourhood)"
    }

    /// Visits so far; the stamp design comes with the M3 redesign
    @ViewBuilder private func visitBadge(_ place: Place) -> some View {
        if let count = model.visits[place.id], count > 0 {
            Text("\(count)")
                .font(.label(15, weight: .bold))
                .foregroundStyle(Tokens.Colors.card)
                .frame(width: 32, height: 32)
                .background(Tokens.Colors.green, in: Circle())
                .padding(12)
                .accessibilityLabel("\(count) visits")
        }
    }
}
