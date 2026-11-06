/**
 * GET /v1/cinema → the cinema shuffler's shelves (lib/cinema.ts → cinemaLibrary;
 * Josh, 2026-11-06, experimental, not linked from the game yet). Each shelf
 * lists films in the shape of a cinema's films (Film in the app), posters from
 * R2 and the director for the film page; a full-length upload, when there is one, is the second video, after the
 * trailer. The app shuffles the shelves and posters on each visit. No sign-in
 * needed, like /v1/content. An empty list for a country without a library.
 */
import { cinemaLibrary, type CinemaVideo } from '@/lib/cinema';
import { imageUrl } from '@/lib/content-api';
import { serverError } from '@/lib/api';

type Film = { tmdbId: number; title: string; year: number; director: string | null; poster: string | null; videos: CinemaVideo[]; related?: number[] };
let cached: { shelves: { id: string; title: string; films: Film[] }[] } | null = null;

function build() {
  const lib = cinemaLibrary();
  if (!lib) return { shelves: [] };
  const films = new Map<number, Film>();
  for (const f of lib.films) {
    const videos = [...f.videos];
    if (f.fullFilm) {
      const full = { youtube: f.fullFilm.youtube, type: lib.fullFilmName, name: `${f.title} (${f.year})`, language: f.fullFilm.language ?? 'und' };
      videos.splice(Math.min(1, videos.length), 0, full);
    }
    // Only films with a poster on R2: the shelves are posters
    const poster = imageUrl(`posters/${f.tmdbId}`);
    if (poster && videos.length) films.set(f.tmdbId, { tmdbId: f.tmdbId, title: f.title, year: f.year, director: f.director, poster, videos });
  }
  // "More like this" on a film page: the films sharing a shelf marked similar (a genre, not "full films")
  for (const [id, film] of films) {
    const near = lib.shelves.filter((s) => s.similar && s.films.includes(id)).flatMap((s) => s.films);
    film.related = [...new Set(near)].filter((other) => other !== id && films.has(other));
  }
  const shelves = lib.shelves
    .map((s) => ({ id: s.id, title: s.title, films: s.films.map((id) => films.get(id)).filter((f): f is Film => !!f) }))
    .filter((s) => s.films.length > 0);
  return { shelves };
}

export async function GET(request: Request) {
  try {
    cached ??= build();
    return Response.json(cached, { headers: { 'cache-control': 'public, max-age=300' } });
  } catch (err) {
    return serverError(request, 'v1 cinema', err);
  }
}
