import SwiftUI
import FuoriCore
import FuoriDesign

/// Where a cinema's card leads: its films
struct CinemaRoute: Hashable {
    let place: Place
}

/// Where a poster leads: the film's videos
struct FilmRoute: Hashable {
    let film: Film
}

/// A cinema (Josh, 2026-11-05, the Rome trial; lib/cinema.ts): a place with no
/// person, its films as posters; a poster opens the film's videos. No level or
/// language rules: the titles are the films' own
struct CinemaView: View {
    let place: Place

    var body: some View {
        // A feed, as on Instagram (Josh, 2026-11-05): one big poster after another
        ScrollView {
            LazyVStack(spacing: 20) {
                ForEach(place.films ?? []) { film in
                    NavigationLink(value: FilmRoute(film: film)) { PosterCard(film: film) }
                        .buttonStyle(PressableStyle())
                        // 80% of the screen's width, the poster's own shape (Josh, 2026-11-05)
                        .containerRelativeFrame(.horizontal) { width, _ in width * 0.8 }
                }
            }
            .padding(Tokens.Space.gutter)
        }
        .background(Tokens.Colors.paper)
        // No title (Josh, 2026-11-05: the cinema's name over the posters read like a film's title
        // and told nothing new): just back and settings; the posters are the page
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .settingsToolbar()
        .navigationDestination(for: FilmRoute.self) { route in TrailerView(film: route.film) }
    }
}

/// A poster, MovieGenius's play button in its corner;
/// no title under it (Josh: the posters have the name on them). VoiceOver reads title and year
private struct PosterCard: View {
    let film: Film
    @ScaledMetric(relativeTo: .title) private var play: CGFloat = 56

    var body: some View {
        AsyncImage(url: film.poster) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.sand }
            .aspectRatio(2 / 3, contentMode: .fit)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card))
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
            .overlay(alignment: .bottomTrailing) {
                ZStack {
                    Circle().fill(.ultraThinMaterial).frame(width: play, height: play)
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: play * 0.79))
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.25), radius: 3, y: 1)
                }
                .padding(Tokens.Space.gutter)
            }
            .contentShape(Rectangle())
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(film.title), \(film.year)")
            .accessibilityHint("Plays its trailer")
            .accessibilityAddTraits(.isButton)
    }
}

/// A film's videos, as in MovieGenius: the first (the official trailer) plays
/// at the top; tapping another below plays it instead
struct TrailerView: View {
    let film: Film
    @State private var playing: Film.Video?
    @State private var ready = false
    @State private var problem: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                if let video = playing ?? film.videos.first {
                    ZStack {
                        Color.black
                        YouTubePlayerView(videoId: video.youtube, onReady: { ready = true }, onError: { problem = $0 })
                            .id(video.youtube)
                            // Its web view is white until YouTube is ready: black and the spinner show instead
                            .opacity(ready ? 1 : 0)
                        if let problem {
                            Text(problem)
                                .typeface(.label, 17, relativeTo: .body)
                                .foregroundStyle(.white)
                                .multilineTextAlignment(.center)
                                .padding()
                        } else if !ready {
                            ProgressView().tint(.white)
                        }
                    }
                    .aspectRatio(16 / 9, contentMode: .fit)
                    .accessibilityElement(children: .contain)
                    .accessibilityLabel(video.name)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text(film.title)
                        .typeface(.display, Tokens.Size.cardTitle, relativeTo: .title, weight: .bold)
                        .foregroundStyle(Tokens.Colors.flapInk)
                        .accessibilityAddTraits(.isHeader)
                    Text(String(film.year))
                        .typeface(.label, Tokens.Size.personRole, relativeTo: .title3)
                        .foregroundStyle(Tokens.Colors.sand)
                }
                .padding(.horizontal, Tokens.Space.gutter)
                .padding(.vertical, 14)
                if film.videos.count > 1 {
                    VStack(spacing: 8) {
                        ForEach(film.videos) { video in
                            VideoRow(video: video, playing: video == (playing ?? film.videos.first)) {
                                guard video != (playing ?? film.videos.first) else { return }
                                ready = false
                                problem = nil
                                playing = video
                            }
                        }
                    }
                    .padding(.horizontal, Tokens.Space.gutter)
                    .padding(.bottom, 32)
                }
            }
        }
        // Dark, as a cinema (and MovieGenius's trailer screen): the video is the light
        .background(Tokens.Colors.ink)
        // The title once, under the player (Josh, 2026-11-05): none in the bar, as on the posters
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Tokens.Colors.ink, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        #endif
        .settingsToolbar()
    }
}

/// One of the film's videos: its name, its kind and language; the one playing is marked
private struct VideoRow: View {
    let video: Film.Video
    let playing: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(alignment: .firstTextBaseline, spacing: 12) {
                Image(systemName: playing ? "play.circle.fill" : "play.circle")
                    .imageScale(.large)
                    .foregroundStyle(playing ? Tokens.Colors.rollNew : Tokens.Colors.sand)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 3) {
                    Text(video.name)
                        .typeface(.label, Tokens.Size.personRole, relativeTo: .title3, weight: .bold)
                        .foregroundStyle(Tokens.Colors.flapInk)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(detail)
                        .typeface(.label, Tokens.Size.body, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.sand)
                }
                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(minHeight: 44)
            .background(Tokens.Colors.flapTile, in: RoundedRectangle(cornerRadius: Tokens.Radius.card))
            .overlay { RoundedRectangle(cornerRadius: Tokens.Radius.card).strokeBorder(playing ? Tokens.Colors.rollNew : .clear, lineWidth: 2) }
            .contentShape(Rectangle())
        }
        .buttonStyle(PressableStyle())
        .accessibilityLabel("\(video.name), \(detail)")
        .accessibilityValue(playing ? "Playing" : "")
    }

    /// "Trailer · Italian": the video's language in the phone's own language
    private var detail: String {
        let language = Locale.current.localizedString(forLanguageCode: video.language) ?? video.language
        return "\(video.type) · \(language)"
    }
}
