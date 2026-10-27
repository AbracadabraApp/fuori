import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The Learn area (docs/learn.md → The Learn area): the book next to Settings
/// on every screen, opening like Settings. It starts with your conversations
/// (Josh, 2026-10-26): newest first, each with the character's portrait, name
/// and place; tapping one opens its Learn page, the same page as in the
/// conversation. The rest of the area (phrases, corrections over time,
/// lessons) grows here later.
struct LearnArea: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var load: Load = .loading
    @State private var open: PastConversationLearn?

    private enum Load {
        case loading
        case failed(String)
        case loaded([APIClient.PastConversation])
    }

    var body: some View {
        NavigationStack {
            List {
                switch load {
                case .loading:
                    HStack { Spacer(); ProgressView(); Spacer() }
                        .listRowBackground(Color.clear)
                case .failed(let message):
                    VStack(alignment: .leading, spacing: 10) {
                        Text(message).foregroundStyle(Tokens.Colors.text)
                        Button("Try again") { Task { await fetch() } }
                    }
                case .loaded(let conversations) where conversations.isEmpty:
                    Text("After you talk to someone, your conversation shows here, with what to learn from it.")
                        .foregroundStyle(Tokens.Colors.muted)
                case .loaded(let conversations):
                    Section("Your conversations") {
                        ForEach(conversations) { c in row(c) }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Tokens.Colors.paper)
            .navigationTitle("Learn")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .task { await fetch() }
        .sheet(item: $open) { past in LearnSheet(model: past) }
    }

    private func fetch() async {
        guard let api = model.api else { return }
        load = .loading
        do {
            load = .loaded(try await api.myConversations())
        } catch {
            load = .failed((error as? APIError)?.message ?? error.localizedDescription)
        }
    }

    @ViewBuilder private func row(_ c: APIClient.PastConversation) -> some View {
        let content = model.content
        let city = content?.city(c.cityId)
        let place = city?.places.first { $0.id == c.placeId }
        if let content, let city, let place, let character = content.character(c.characterId), let api = model.api {
            Button {
                open = PastConversationLearn(conversation: c, character: character, place: place, language: content.language, api: api)
            } label: {
                HStack(spacing: 12) {
                    AsyncImage(url: character.portrait) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        Tokens.Colors.sand
                    }
                    .frame(width: 48, height: 48)
                    .clipShape(Circle())
                    .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(character.name)
                            .typeface(.display, 18, relativeTo: .headline, weight: .bold)
                            .foregroundStyle(Tokens.Colors.ink)
                        Text("\(place.name), \(city.name)")
                            .typeface(.label, 15, relativeTo: .subheadline)
                            .foregroundStyle(Tokens.Colors.muted)
                    }
                    Spacer(minLength: 8)
                    Text(when(c.startedAt))
                        .typeface(.label, 14, relativeTo: .footnote)
                        .foregroundStyle(Tokens.Colors.muted)
                }
                .frame(minHeight: 44)
                .contentShape(.rect)
            }
            .buttonStyle(.plain)
            .accessibilityHint("Opens what to learn from this conversation")
        }
    }

    /// "Today", "Yesterday", else the date
    private func when(_ iso: String) -> String {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = f.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) else { return "" }
        let cal = Calendar.current
        if cal.isDateInToday(date) { return "Today" }
        if cal.isDateInYesterday(date) { return "Yesterday" }
        return date.formatted(.dateTime.day().month(.abbreviated))
    }
}
