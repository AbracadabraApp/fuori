/**
 * GET /v1/cinema → the cinema shuffler's shelves (lib/cinema.ts → cinemaLibrary;
 * Josh, 2026-11-06, experimental, not linked from the game yet). Each shelf
 * lists films in the shape of a cinema's films (Film in the app), posters from
 * R2, with the film page's WhyWatch and More Ideas (cinema-pages.json); a full-length upload, when there is one, is the second video, after the
 * trailer. The app shuffles the shelves and posters on each visit. No sign-in
 * needed, like /v1/content. An empty list for a country without a library.
 */
import { cinemaLibrary, cinemaPages, type CinemaVideo } from '@/lib/cinema';
import { imageUrl } from '@/lib/content-api';
import { serverError } from '@/lib/api';

type Idea = { tmdbId: number; connection: string };
type Film = {
  tmdbId: number; title: string; year: number; poster: string | null; videos: CinemaVideo[];
  whyWatch?: { recommendation: 'YES' | 'NO'; reasons: string[]; context: string };
  moreIdeas?: Idea[];
};
type Labels = { yes: string; no: string; moreIdeas: string };
let cached: { labels?: Labels; shelves: { id: string; title: string; films: Film[] }[] } | null = null;

/** Titles compared without accents, case or punctuation, so "Malèna" finds "Malena" */
const key = (title: string, year: number) => `${title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')}|${year}`;

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
    if (poster && videos.length) films.set(f.tmdbId, { tmdbId: f.tmdbId, title: f.title, year: f.year, poster, videos });
  }
  // The film page (cinema-pages.json): WhyWatch, and the More Ideas whose film is in the library
  const words = cinemaPages();
  const byTitle = new Map([...films.values()].map((f) => [key(f.title, f.year), f.tmdbId]));
  for (const [id, film] of films) {
    const page = words?.films[String(id)];
    if (!page) continue;
    film.whyWatch = page.whyWatch;
    film.moreIdeas = page.moreIdeas
      .map((idea) => ({ tmdbId: byTitle.get(key(idea.title, idea.year)), connection: idea.connection }))
      .filter((idea): idea is Idea => idea.tmdbId !== undefined && idea.tmdbId !== id);
  }
  const shelves = lib.shelves
    .map((s) => ({ id: s.id, title: s.title, films: s.films.map((id) => films.get(id)).filter((f): f is Film => !!f) }))
    .filter((s) => s.films.length > 0);
  return { labels: words?.labels, shelves };
}

export async function GET(request: Request) {
  try {
    cached ??= build();
    return Response.json(cached, { headers: { 'cache-control': 'public, max-age=300' } });
  } catch (err) {
    return serverError(request, 'v1 cinema', err);
  }
}
