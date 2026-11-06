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
/// A poster opens the film's page (FilmPage); its poster opens the videos
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
        .navigationDestination(for: FilmPageRoute.self) { route in FilmPage(film: route.film, related: related(route.film)) }
        // Once per visit: coming back from a trailer keeps the order
        .task { if rows.isEmpty { await load() } }
        .refreshable { await load() }
    }

    /// "More like this": the server's list for the film, a dozen in a new order each time
    private func related(_ film: Film) -> [Film] {
        let all = Dictionary(rows.flatMap(\.films).map { ($0.tmdbId, $0) }, uniquingKeysWith: { a, _ in a })
        return Array((film.related ?? []).compactMap { all[$0] }.shuffled().prefix(12))
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
                        NavigationLink(value: FilmPageRoute(film: film)) { ShelfPoster(film: film) }
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
            .accessibilityHint("Opens the film")
            .accessibilityAddTraits(.isButton)
    }
}

/// Where a shelf poster leads: the film's page
struct FilmPageRoute: Hashable {
    let film: Film
}

/// A film's page, as MovieGenius's movie page, pared down (Josh, 2026-11-06: "build
/// movie page… moviegenius already has tools/styles - use them"; no synopsis, the
/// critic will live in the cinema): the big poster with MovieGenius's play button,
/// which opens the trailer and the film's other videos; the year and director;
/// then "more like this" from the library's own shelves, not TMDB's suggestions
struct FilmPage: View {
    let film: Film
    let related: [Film]

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                NavigationLink(value: FilmRoute(film: film)) { HeroPoster(film: film) }
                    .buttonStyle(PressableStyle())
                    // MovieGenius's hero: nearly the full width (350 of 390 pt)
                    .containerRelativeFrame(.horizontal) { width, _ in width * 0.9 }
                    .padding(.top, 12)
                Text(credit)
                    .typeface(.label, Tokens.Size.body, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.sand)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Tokens.Space.gutter)
                    .padding(.top, 16)
                if !related.isEmpty {
                    ShelfView(title: "More like this", films: related)
                        .padding(.top, 32)
                }
            }
            .padding(.bottom, 24)
        }
        .background(Tokens.Colors.ink)
        .navigationTitle(film.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.ink, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        #endif
    }

    /// "1994 · Michael Radford"
    private var credit: String {
        [String(film.year), film.director].compactMap { $0 }.joined(separator: " · ")
    }
}

/// The film page's poster: MovieGenius's hero, its corners, light and play button
private struct HeroPoster: View {
    let film: Film

    var body: some View {
        AsyncImage(url: film.poster) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.flapTile }
            .aspectRatio(2 / 3, contentMode: .fit)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.poster, style: .continuous))
            .shadow(color: Tokens.Colors.cinemaGlow.opacity(0.3), radius: 8)
            .shadow(color: Tokens.Colors.cinemaGlow.opacity(0.2), radius: 20)
            .shadow(color: .black.opacity(0.6), radius: 16, y: 8)
            .shadow(color: .black.opacity(0.4), radius: 32, y: 16)
            // MovieGenius's play button: 56 pt on a 350 pt poster, 16 pt in from the corner
            .overlay {
                GeometryReader { g in
                    let d = g.size.width * 0.16
                    Image(systemName: "play.fill")
                        .font(.system(size: d * 0.38))
                        .foregroundStyle(.white)
                        .offset(x: d * 0.03)
                        .frame(width: d, height: d)
                        .glassEffect(.clear, in: .circle)
                        .padding(g.size.width * 0.046)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                }
            }
            .contentShape(Rectangle())
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(film.title), \(film.year)")
            .accessibilityHint("Plays its trailer")
            .accessibilityAddTraits(.isButton)
    }
}
