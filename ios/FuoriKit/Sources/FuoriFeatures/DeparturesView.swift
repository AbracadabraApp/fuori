import SwiftUI
import FuoriCore
import FuoriDesign

/// The departures board, opened by tapping the station (docs/station-feature-
/// decision.md; docs/13-ios-conventions.md R10): a sheet titled with the
/// language's "Dove vuoi andare?", Cancel leading, every city in a list, each
/// with its platform from here. The current city is disabled and says so in
/// words ("Sei qui"), not only in colour. Picking a city closes the sheet; the
/// place list then opens the ticket seller with that ticket.
struct DeparturesView: View {
    let city: City
    let content: Content
    let onPick: (City) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List(content.firstScreenCities + content.moreCities) { destination in
                Button {
                    onPick(destination)
                    dismiss()
                } label: {
                    row(destination)
                }
                .disabled(destination.id == city.id)
                .listRowBackground(Tokens.Colors.card)
            }
            .scrollContentBackground(.hidden)
            .background(Tokens.Colors.paper)
            .navigationTitle(content.language.ui.whereTo)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func row(_ destination: City) -> some View {
        let here = destination.id == city.id
        let words = content.language.ui.ticket
        return HStack(alignment: .firstTextBaseline, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(destination.name)
                    .typeface(.display, Tokens.Size.body + 3, relativeTo: .title3, weight: .semibold)
                    .foregroundStyle(here ? Tokens.Colors.muted : Tokens.Colors.ink)
                if let region = destination.region {
                    Text(region)
                        .typeface(.label, Tokens.Size.badge, relativeTo: .subheadline)
                        .foregroundStyle(Tokens.Colors.muted)
                }
            }
            Spacer(minLength: 8)
            if here {
                Text(content.language.ui.youAreHere)
                    .typeface(.label, Tokens.Size.badge, relativeTo: .subheadline, weight: .semibold)
                    .foregroundStyle(Tokens.Colors.muted)
            } else {
                // The platform on a split-flap tile, as on a station board
                Text("\(words.platform) \(Departure(from: city.id, to: destination.id).platform)")
                    .typeface(.flip, Tokens.Size.badge + 2, relativeTo: .subheadline, weight: .semibold)
                    .foregroundStyle(Tokens.Colors.flapInk)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Tokens.Colors.flapTile, in: RoundedRectangle(cornerRadius: 4))
            }
        }
        .frame(minHeight: 44)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}
