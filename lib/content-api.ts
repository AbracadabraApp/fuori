/**
 * What the app shows, as JSON for GET /v1/content: the country's language
 * words, its cities and places in feed order, the people at those places, and
 * an image address for each (Cloudflare R2, content/<country>/images.json).
 *
 * Display fields only. Prompts, personalities, image prompts and voices stay
 * on the server: the app sends ids and the server works out the rest
 * (lib/characters/for-visit.ts). Hidden cities and places are left out, as on
 * the web. `version` changes whenever any of this changes, so the app knows to
 * refresh its copy.
 */

import { tutorSheet as magdaSheet } from '@/lib/tutor';
import { createHash } from 'crypto';
import { cities, country, language, onboarding, pack } from '@/content';
import { welcomeContent } from '@/lib/welcome';
import { flashcards, deckCards } from '@/lib/flashcards';
import { lessonUnits, lessonAreas } from '@/lib/lessons';
import { cultureSet } from '@/lib/culture';
import { cinemaFilms, cinemaLibrary } from '@/lib/cinema';
import { characterForPlace } from '@/lib/characters/for-place';
import { feedOrder } from '@/lib/places/feed-order';
import { imageListFor } from '@/content';
import type { Gender } from '@/lib/types';

export interface ContentPlace {
  id: string;
  name: string;
  kind: string;
  neighbourhood: string;
  /** Opens the departures board instead of a conversation */
  station: boolean;
  /** An open space or landmark (the pack's openKinds): the app puts one in the
   *  first few cards of a city's daily order (Josh, 2026-11-08) */
  open: boolean;
  /** Who you meet here; absent when nobody is there yet */
  characterId?: string;
  image: string | null;
  /** A food place's menu or board, in the language (Osteria da Nino, the Sorbetteria) */
  menu?: string[];
  /** Where to write the menu on the place picture (fractions of the square picture) */
  menuBoard?: { x: number; y: number; width: number; height: number };
}

export interface ContentCity {
  id: string;
  name: string;
  region?: string;
  /** Shown after "Mostra altro" rather than on the first screen */
  more: boolean;
  image: string | null;
  places: ContentPlace[];
}

export interface ContentCharacter {
  id: string;
  name: string;
  role: string;
  gender?: Gender;
  /** Teaches (Magda): the app may show her differently */
  tutor: boolean;
  portrait: string | null;
}

/** The greeter (docs/onboarding-design.md): her fixed lines, her four poses
 *  and how far to lift her picture so her face stays clear of the text */
export interface ContentOnboarding {
  guide: { id: string; lift: number; poses: Record<'welcome' | 'listen' | 'talk' | 'laugh', string | null> };
  lines: typeof onboarding.lines;
  /** The orientation tour's lines (docs/orientation-script.md), steps 1–3 */
  orientation: typeof onboarding.orientation;
  welcome: { characterId: string; cityId: string; placeId: string; go: { line: string; en: string } } | null;
}

export interface Content {
  version: string;
  country: string;
  /** The country's card for the app's country choice and Settings */
  card: { country: string; learn: string; image: string | null };
  language: {
    code: string;
    name: string;
    speechLang: string;
    appName: string;
    ui: typeof language.ui;
  };
  ticketTheme: typeof pack.ticketTheme;
  onboarding: ContentOnboarding;
  cities: ContentCity[];
  characters: Record<string, ContentCharacter>;
}

/** A picture's public URL from this country's image list, or null */
export function imageUrl(id: string): string | null {
  const list = imageListFor(country);
  const entry = list?.images[id];
  return entry ? `${list.base}/${entry.key}` : null;
}

/** Same test as the web's city screen (app/page.tsx) */
export const isStation = (placeId: string) => placeId.startsWith('stazione-') || placeId.startsWith('terminal-');

export function buildContent(): Content {
  const list = imageListFor(country);
  const image = (id: string) => {
    const entry = list?.images[id];
    return entry ? `${list.base}/${entry.key}` : null;
  };

  const films = (cityId: string, placeId: string) => {
    const list = cinemaFilms(cityId, placeId);
    return list && { films: list.map((f) => ({ tmdbId: f.tmdbId, title: f.title, year: f.year, poster: image(`posters/${f.tmdbId}`), videos: f.videos })) };
  };
  const characters: Record<string, ContentCharacter> = {};
  const shown = cities.filter((c) => !c.hidden);
  const out: ContentCity[] = shown.map((city) => ({
    id: city.id,
    name: city.name,
    ...(city.region ? { region: city.region } : {}),
    more: !!city.more,
    image: image(`cities/${city.id}`),
    // Language schools are hidden (Josh, 2026-10-27): Magda teaches in Learn,
    // not at a school in a city. They stay in the content, so old
    // conversations and /v1/turn still find them
    places: feedOrder({ ...city, places: city.places.filter((p) => !p.hidden && p.characterId !== pack.tutor.id) }).map((place) => {
      const person = characterForPlace(city, place);
      if (person && !characters[person.id]) {
        characters[person.id] = {
          id: person.id,
          name: person.name,
          role: person.role,
          ...(person.gender ? { gender: person.gender } : {}),
          tutor: person.id === pack.tutor.id,
          portrait: image(`portraits/${person.id}`),
        };
      }
      return {
        id: place.id,
        name: place.name,
        kind: place.kind,
        neighbourhood: place.neighbourhood,
        station: isStation(place.id),
        open: pack.openKinds.includes(place.kind),
        ...(person ? { characterId: person.id } : {}),
        image: image(`places/${place.id}`),
        ...(place.menu?.length ? { menu: place.menu } : {}),
        ...(place.menu?.length && place.menuBoard ? { menuBoard: place.menuBoard } : {}),
        // A cinema (lib/cinema.ts): its films, posters from R2 (app builds from 2026-11-06)
        ...(films(city.id, place.id) ?? {}),
      };
    }),
  }));

  // Magda isn't in any city (lib/tutor.ts), but Learn shows her (the Lessons card)
  const tutorSheet = magdaSheet();
  if (tutorSheet && !characters[tutorSheet.id]) {
    characters[tutorSheet.id] = { id: tutorSheet.id, name: tutorSheet.name, role: tutorSheet.role, ...(tutorSheet.gender ? { gender: tutorSheet.gender } : {}), tutor: true, portrait: image(`portraits/${tutorSheet.id}`) };
  }

  const body = {
    country,
    /** Flashcards (docs/flashcards.md): the starter words, pictured ones first */
    flashcards: flashcards(image),
    /** The master deck: tall pictures and a recording per word (app builds from 2026-10-28) */
    cards: deckCards(image),
    /** The syllabus lessons for Learn's Lessons card (lib/lessons.ts; app builds from 2026-10-29) */
    lessons: lessonUnits(),
    /** The Learn page's lessons as chips in their areas (lib/lessons.ts → lessonAreas; app builds from 2026-11-03) */
    lessonAreas: lessonAreas(),
    /** The Learn page's cultural lessons, outside the lesson sets (lib/culture.ts; app builds from 2026-11-04) */
    culture: cultureSet().map(({ id, chip, topic }) => ({ id, chip, topic })),
    /** The country has a cinema shuffler (GET /v1/cinema; the film reel by Learn, Josh, 2026-11-06; app builds from 2026-11-06) */
    // Only once a film's poster is on R2: Mexico's library (2026-11-09) arrives before its posters, which the laptop uploads
    cinema: (cinemaLibrary()?.films ?? []).some((f) => image(`posters/${f.tmdbId}`) !== null),
    card: { ...language.card, image: image(`country/${country}`) },
    language: {
      code: language.code,
      name: language.name,
      speechLang: language.speechLang,
      appName: language.appName,
      ui: language.ui,
    },
    ticketTheme: pack.ticketTheme,
    onboarding: {
      guide: {
        id: onboarding.guide.id,
        lift: onboarding.guide.lift,
        poses: {
          welcome: image('guide/welcome'),
          listen: image('guide/listen'),
          talk: image('guide/talk'),
          laugh: image('guide/laugh'),
        },
      },
      lines: onboarding.lines,
      orientation: onboarding.orientation,
      // The welcome conversation (lib/welcome.ts): who plays it, where, and the last button's words
      welcome: welcomeContent(),
    },
    cities: out,
    characters,
  };
  const version = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 12);
  return { version, ...body };
}
