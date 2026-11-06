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
/// A poster opens the film's page (FilmPage), whose poster plays the trailer
struct CinemaShufflerView: View {
    let api: APIClient

    /// A shelf in this visit's order
    private struct Row: Identifiable {
        let id: String
        let title: String
        let films: [Film]
    }

    @State private var rows: [Row] = []
    @State private var labels: CinemaShelves.Labels?
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
        .navigationDestination(for: FilmPageRoute.self) { route in FilmPage(film: route.film, labels: labels, find: find) }
        // Once per visit: coming back from a trailer keeps the order
        .task { if rows.isEmpty { await load() } }
        .refreshable { await load() }
    }

    /// A film in this visit's shelves, for More Ideas
    private func find(_ tmdbId: Int) -> Film? {
        rows.lazy.flatMap(\.films).first { $0.tmdbId == tmdbId }
    }

    private func load() async {
        do {
            let cinema = try await api.cinema()
            labels = cinema.labels
            rows = cinema.shelves.shuffled().map { Row(id: $0.id, title: $0.title, films: $0.films.shuffled()) }
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

/// Where a shelf poster or an idea leads: the film's page
struct FilmPageRoute: Hashable {
    let film: Film
}

/// A film's page: MovieGenius's movie page in the learned language (Josh, 2026-11-06:
/// "moviegenius already has tools/styles - use them", "vertical scroll"). Its big
/// poster with the play button opens the trailer and the film's other videos; then
/// WhyWatch (yes or no, three reasons, a few lines); then More Ideas, one under
/// another, each opening its own page. Words in the learned language come from the
/// server (cinema-pages.json)
struct FilmPage: View {
    let film: Film
    let labels: CinemaShelves.Labels?
    let find: (Int) -> Film?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                NavigationLink(value: FilmRoute(film: film)) { HeroPoster(film: film) }
                    .buttonStyle(PressableStyle())
                    // MovieGenius's hero: nearly the full width (350 of 390 pt)
                    .containerRelativeFrame(.horizontal) { width, _ in width * 0.9 }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 12)
                if let why = film.whyWatch {
                    WhyWatchCard(why: why, labels: labels)
                }
                if !ideas.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        if let title = labels?.moreIdeas {
                            Text(title)
                                .typeface(.display, Tokens.Size.personName, relativeTo: .title2, weight: .bold)
                                .foregroundStyle(Tokens.Colors.flapInk)
                                .accessibilityAddTraits(.isHeader)
                        }
                        ForEach(ideas, id: \.film.tmdbId) { idea in
                            NavigationLink(value: FilmPageRoute(film: idea.film)) { IdeaRow(film: idea.film, connection: idea.connection) }
                                .buttonStyle(PressableStyle())
                        }
                    }
                    .padding(.horizontal, Tokens.Space.gutter)
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

    /// More Ideas found in this visit's shelves (each is in the library)
    private var ideas: [(film: Film, connection: String)] {
        (film.moreIdeas ?? []).compactMap { idea in find(idea.tmdbId).map { ($0, idea.connection) } }
    }
}

/// MovieGenius's WhyWatch card: a mark and the verdict, the reasons as bullets, then the context
private struct WhyWatchCard: View {
    let why: Film.WhyWatch
    let labels: CinemaShelves.Labels?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: why.recommended ? "sparkles" : "hand.raised")
                    .foregroundStyle(why.recommended ? Tokens.Colors.cinemaGlow : Tokens.Colors.rollRegular)
                    .accessibilityHidden(true)
                if let verdict = why.recommended ? labels?.yes : labels?.no {
                    Text(verdict)
                        .typeface(.label, Tokens.Size.personRole, relativeTo: .headline, weight: .bold)
                        .foregroundStyle(Tokens.Colors.flapInk)
                }
            }
            VStack(alignment: .leading, spacing: 8) {
                ForEach(why.reasons, id: \.self) { reason in
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text("•").accessibilityHidden(true)
                        Text(reason)
                    }
                }
            }
            .typeface(.label, Tokens.Size.body, relativeTo: .body)
            .foregroundStyle(Tokens.Colors.flapInk)
            Text(why.context)
                .typeface(.label, Tokens.Size.body, relativeTo: .body)
                .foregroundStyle(Tokens.Colors.sand)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Tokens.Colors.flapTile, in: RoundedRectangle(cornerRadius: Tokens.Radius.card))
        .padding(.horizontal, Tokens.Space.gutter)
    }
}

/// One idea, as MovieGenius's More Ideas card: a small poster, the title and year, and why it's like this one
private struct IdeaRow: View {
    let film: Film
    let connection: String
    @ScaledMetric(relativeTo: .body) private var posterWidth: CGFloat = 72

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            AsyncImage(url: film.poster) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.flapTile }
                .frame(width: posterWidth, height: posterWidth * 1.5)
                .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card, style: .continuous))
            VStack(alignment: .leading, spacing: 4) {
                Text("\(film.title) (\(String(film.year)))")
                    .typeface(.label, Tokens.Size.personRole, relativeTo: .headline, weight: .bold)
                    .foregroundStyle(Tokens.Colors.flapInk)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Text(connection)
                    .typeface(.label, Tokens.Size.body, relativeTo: .body)
                    .foregroundStyle(Tokens.Colors.sand)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .frame(minHeight: 44)
        .background(Tokens.Colors.flapTile, in: RoundedRectangle(cornerRadius: Tokens.Radius.card))
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityHint("Opens the film")
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
