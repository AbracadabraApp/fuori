import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The cinema, opened by the film reel before Learn (Josh, 2026-11-06: "Could also add
/// a film reel icon next to learn", tried with the family): a sheet over the game,
/// like Learn, closed with its X. `-FuoriOpenCinema YES` opens it at launch (debug)
struct CinemaSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if let api = model.api { CinemaShufflerView(api: api) } else { Tokens.Colors.ink }
            }
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button { dismiss() } label: { Image(systemName: "xmark") }
                        .accessibilityLabel("Close")
                }
            }
        }
        // Its trailer screens keep Learn and Settings but not the reel: it's open already
        .environment(\.insideCinema, true)
    }
}

extension EnvironmentValues {
    /// Inside the cinema sheet: the toolbar leaves out the film reel
    @Entry var insideCinema = false
}

/// The cinema shuffler (Josh, 2026-11-06: "experimental - Netflix style shuffler -
/// reference movie genius home"): shelves of posters,
/// each scrolling sideways, as on MovieGenius's home. The shelves and the posters on
/// them come in a new order each time the page opens, and again on pull to refresh.
/// A poster opens the film's videos (TrailerView): the trailer first, then the full
/// film when there is one
struct CinemaShufflerView: View {
    let api: APIClient

    /// A shelf in this visit's order
    private struct Row: Identifiable {
        let id: String
        let title: String
        let films: [Film]
    }

    @State private var rows: [Row] = []
    @State private var loaded = false
    @State private var problem: String?

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 28) {
                ForEach(rows) { row in ShelfView(title: row.title, films: row.films) }
            }
            .padding(.vertical, 16)
        }
        .overlay {
            if let problem {
                Text(problem)
                    .typeface(.label, Tokens.Size.body, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.flapInk)
                    .multilineTextAlignment(.center)
                    .padding(Tokens.Space.gutter)
            } else if !loaded {
                ProgressView().tint(Tokens.Colors.flapInk)
            }
        }
        // A dark room, like the cinema and its trailer screen
        .background(Tokens.Colors.ink)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.ink, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        #endif
        .navigationDestination(for: FilmRoute.self) { route in TrailerView(film: route.film) }
        // Once per visit: coming back from a trailer keeps the order
        .task { if rows.isEmpty { await load() } }
        .refreshable { await load() }
    }

    private func load() async {
        do {
            let shelves = try await api.cinema().shelves
            rows = shelves.shuffled().map { Row(id: $0.id, title: $0.title, films: $0.films.shuffled()) }
            problem = nil
        } catch {
            problem = error.localizedDescription
        }
        loaded = true
    }
}

/// One shelf: its name, then its posters in a row that scrolls sideways
private struct ShelfView: View {
    let title: String
    let films: [Film]
    /// MovieGenius's poster width on its home page, scaled with the text size
    @ScaledMetric(relativeTo: .body) private var posterWidth: CGFloat = 150

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .typeface(.label, Tokens.Size.personRole, relativeTo: .title3, weight: .bold)
                .foregroundStyle(Tokens.Colors.flapInk)
                .padding(.horizontal, Tokens.Space.gutter)
                .accessibilityAddTraits(.isHeader)
            ScrollView(.horizontal) {
                LazyHStack(spacing: 10) {
                    ForEach(films) { film in
                        NavigationLink(value: FilmRoute(film: film)) { ShelfPoster(film: film) }
                            .buttonStyle(PressableStyle())
                            .frame(width: posterWidth)
                    }
                }
                .padding(.horizontal, Tokens.Space.gutter)
            }
            .scrollIndicators(.hidden)
            // The posters' glow isn't cut off at the row's edges
            .scrollClipDisabled()
        }
    }
}

/// A poster on a shelf: MovieGenius's corners and light; the title is on the poster.
/// VoiceOver reads the title and year
private struct ShelfPoster: View {
    let film: Film

    var body: some View {
        AsyncImage(url: film.poster) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.flapTile }
            .aspectRatio(2 / 3, contentMode: .fit)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.poster, style: .continuous))
            .shadow(color: Tokens.Colors.cinemaGlow.opacity(0.25), radius: 6)
            .shadow(color: .black.opacity(0.6), radius: 10, y: 6)
            .contentShape(Rectangle())
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(film.title), \(film.year)")
            .accessibilityHint("Plays its trailer")
            .accessibilityAddTraits(.isButton)
    }
}
