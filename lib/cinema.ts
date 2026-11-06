/**
 * Cinemas (content/<country>/cinema.json; Josh, 2026-11-05, the Rome trial):
 * a place with no person. Tapping it shows its films as posters; a poster
 * plays the film's first video, with its other videos below, as in
 * MovieGenius. No level or language rules: culture counts as much as
 * language. The data comes from TMDB once (posters to R2 by
 * scripts/cinema-posters.mjs); the app never calls TMDB.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { pack } from '@/content';

export interface CinemaVideo { youtube: string; type: string; name: string; language: string }
export interface CinemaFilm { tmdbId: number; title: string; year: number; poster: string; videos: CinemaVideo[] }
type CinemaFile = { cinemas: Record<string, { place: string; films: CinemaFilm[] }> };

let cached: CinemaFile | null = null;
function file(): CinemaFile {
  if (cached) return cached;
  const path = join(process.cwd(), 'content', pack.id, 'cinema.json');
  cached = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as CinemaFile) : { cinemas: {} };
  return cached;
}

/** The films showing at a place, or null if the place isn't a cinema */
export function cinemaFilms(cityId: string, placeId: string): CinemaFilm[] | null {
  const c = file().cinemas[cityId];
  return c && c.place === placeId ? c.films : null;
}

/**
 * The cinema shuffler's library (content/<country>/cinema-library.json; Josh,
 * 2026-11-06, experimental and not linked from the game): rows of posters, as
 * on MovieGenius home. `fullFilm` is a full-length YouTube upload of the film.
 */
export interface LibraryFilm { tmdbId: number; title: string; year: number; posterUrl: string | null; videos: CinemaVideo[]; fullFilm: { youtube: string; language: string | null } | null }
export interface CinemaLibrary { fullFilmName: string; shelves: { id: string; title: string; films: number[] }[]; films: LibraryFilm[] }

let library: CinemaLibrary | null | undefined;
/** The country's library, or null if it has none */
export function cinemaLibrary(): CinemaLibrary | null {
  if (library !== undefined) return library;
  const path = join(process.cwd(), 'content', pack.id, 'cinema-library.json');
  library = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as CinemaLibrary) : null;
  return library;
}
