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

import { createHash } from 'crypto';
import { cities, country, language, onboarding, pack } from '@/content';
import { flashcards } from '@/lib/flashcards';
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
  /** Who you meet here; absent when nobody is there yet */
  characterId?: string;
  image: string | null;
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

/** Same test as the web's city screen (app/page.tsx) */
const isStation = (placeId: string) => placeId.startsWith('stazione-') || placeId.startsWith('terminal-');

export function buildContent(): Content {
  const list = imageListFor(country);
  const image = (id: string) => {
    const entry = list?.images[id];
    return entry ? `${list.base}/${entry.key}` : null;
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
        ...(person ? { characterId: person.id } : {}),
        image: image(`places/${place.id}`),
      };
    }),
  }));

  // Magda isn't in any city's places now, but Learn shows her (the Lessons card)
  const tutorCity = cities.find((c) => c.places.some((p) => p.characterId === pack.tutor.id));
  const tutorPlace = tutorCity?.places.find((p) => p.characterId === pack.tutor.id);
  const tutorSheet = tutorCity && tutorPlace ? characterForPlace(tutorCity, tutorPlace) : null;
  if (tutorSheet && !characters[tutorSheet.id]) {
    characters[tutorSheet.id] = { id: tutorSheet.id, name: tutorSheet.name, role: tutorSheet.role, ...(tutorSheet.gender ? { gender: tutorSheet.gender } : {}), tutor: true, portrait: image(`portraits/${tutorSheet.id}`) };
  }

  const body = {
    country,
    /** Flashcards (docs/flashcards.md): the starter words, pictured ones first */
    flashcards: flashcards(image),
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
    },
    cities: out,
    characters,
  };
  const version = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 12);
  return { version, ...body };
}
