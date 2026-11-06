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
    @ScaledMetric(relativeTo: .body) private var posterWidth: CGFloat = 150

    var body: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: posterWidth), spacing: 14, alignment: .top)], spacing: 20) {
                ForEach(place.films ?? []) { film in
                    NavigationLink(value: FilmRoute(film: film)) { PosterCard(film: film) }
                        .buttonStyle(PressableStyle())
                }
            }
            .padding(Tokens.Space.gutter)
        }
        .background(Tokens.Colors.paper)
        .navigationTitle(place.name)
        .settingsToolbar()
        .navigationDestination(for: FilmRoute.self) { route in TrailerView(film: route.film) }
    }
}

/// A poster with the film's title and year under it
private struct PosterCard: View {
    let film: Film

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            AsyncImage(url: film.poster) { $0.resizable().scaledToFill() } placeholder: { Tokens.Colors.sand }
                .aspectRatio(2 / 3, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.card))
                .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
                .accessibilityHidden(true)
            Text(film.title)
                .typeface(.display, 18, relativeTo: .headline, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
            Text(String(film.year))
                .typeface(.label, 15, relativeTo: .subheadline)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
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
                        .typeface(.display, 28, relativeTo: .title2, weight: .bold)
                        .foregroundStyle(Tokens.Colors.ink)
                        .accessibilityAddTraits(.isHeader)
                    Text(String(film.year))
                        .typeface(.label, 17, relativeTo: .body)
                        .foregroundStyle(Tokens.Colors.muted)
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
                    .padding(.bottom, 24)
                }
            }
        }
        .background(Tokens.Colors.paper)
        .navigationTitle(film.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
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
                    .foregroundStyle(playing ? Tokens.Colors.green : Tokens.Colors.muted)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 3) {
                    Text(video.name)
                        .typeface(.label, 17, relativeTo: .body, weight: .bold)
                        .foregroundStyle(Tokens.Colors.text)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(detail)
                        .typeface(.label, 15, relativeTo: .subheadline)
                        .foregroundStyle(Tokens.Colors.muted)
                }
                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(minHeight: 44)
            .background(playing ? Tokens.Colors.youBubble : Tokens.Colors.card, in: RoundedRectangle(cornerRadius: Tokens.Radius.card))
            .overlay { RoundedRectangle(cornerRadius: Tokens.Radius.card).strokeBorder(playing ? Tokens.Colors.youEdge : Tokens.Colors.chipBorder, lineWidth: 1.5) }
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
