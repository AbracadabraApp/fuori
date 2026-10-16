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
import { cities, country, language, pack } from '@/content';
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

export interface Content {
  version: string;
  country: string;
  /** The country's card for the app's country choice and Settings */
  card: { country: string; learn: string; greeting: string; image: string | null };
  language: {
    code: string;
    name: string;
    speechLang: string;
    appName: string;
    ui: typeof language.ui;
  };
  ticketTheme: typeof pack.ticketTheme;
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
    places: feedOrder({ ...city, places: city.places.filter((p) => !p.hidden) }).map((place) => {
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

  const body = {
    country,
    card: { ...language.card, image: image(`country/${country}`) },
    language: {
      code: language.code,
      name: language.name,
      speechLang: language.speechLang,
      appName: language.appName,
      ui: language.ui,
    },
    ticketTheme: pack.ticketTheme,
    cities: out,
    characters,
  };
  const version = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 12);
  return { version, ...body };
}
