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
