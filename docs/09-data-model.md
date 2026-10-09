# Data Model

Hand-written content (city pantries, anchor characters, Magda, level rules, the suggested route) lives in the repo as TypeScript files under `content/it/` (one folder per language). Everything generated during play (characters, scenes, suggestions) and all learner progress is learner data, stored in localStorage (M1) then Postgres (M4).

## Content Types

Hand-written ones live in `content/it/` as `.ts` files, committed to the repo. Generated characters and scenes use the same shapes and are stored with learner data.

### Character Sheet

```typescript
type Mood = 'warm' | 'amused' | 'curious' | 'busy';
type Formality = 'Lei' | 'tu';
type Pace = 'slow' | 'normal' | 'quick';
type Familiarity = 'sconosciuto' | 'cliente' | 'habitue' | 'amico';

interface CharacterSheet {
  id: string;                    // "giulia", "rita"
  name: string;                  // "Giulia"
  age: number;                   // 32
  role: string;                  // "barista"
  city: string;                  // "Roma"
  origin: 'anchor' | 'generated' | 'tutor'; // hand-written anchor, created during play, or Magda
  placeId?: string;              // where you meet them ("roma-bar-giulia")

  personality: {
    traits: string[];            // ["quick", "funny", "warm"]
    caresAbout: string[];        // ["good coffee", "neighborhood gossip", "her regulars"]
    secret?: string;             // "Wants to open her own place someday"
  };

  speech: {
    formality: Formality;        // "tu" - switches based on familiarity
    pace: Pace;                  // "quick" - affects TTS speed in UI
    regionalisms: string[];      // ["anvedi", "daje"] for Romans
    description: string;         // "Fast-talking, informal, lots of questions"
  };

  appearance: {
    description: string;         // "Italian woman in her early 30s, dark curly hair..."
    setting: string;             // "Behind the counter of a small Roman coffee bar"
  };

  portrait: {
    kind: 'illustrated' | 'svg'; // illustrated for anchors and Magda, SVG avatar for generated people
    prompt?: string;             // Image prompt for illustrated portraits (see Visuals)
    avatarSeed?: string;         // Drives the SVG avatar (age, hair, skin, colours) so it stays consistent
  };
}
```

**Example:** `content/it/characters/giulia.ts`

```typescript
import { CharacterSheet } from '@/lib/types';

export const giulia: CharacterSheet = {
  id: 'giulia',
  name: 'Giulia',
  age: 32,
  role: 'barista',
  city: 'Roma',
  origin: 'anchor',
  placeId: 'roma-bar-giulia',
  personality: {
    traits: ['quick', 'funny', 'warm', 'curious'],
    caresAbout: ['good coffee', 'neighborhood gossip', 'her regulars'],
    secret: 'Wants to open her own place someday',
  },
  speech: {
    formality: 'tu',
    pace: 'quick',
    regionalisms: ['daje', 'anvedi'],   // used sparingly at A1–A2
    description: 'Fast-talking, informal, uses Roman slang, lots of questions',
  },
  appearance: {
    description: 'Italian woman in her early 30s, dark curly hair tied up messily, small silver hoop earrings, black barista apron over a striped shirt, quick lively eyes',
    setting: 'Behind the counter of a small Roman coffee bar',
  },
  portrait: { kind: 'illustrated' },
};
```

### City Pantry

The ingredients Claude builds suggestions and scenes from. One file per city.

```typescript
interface Place {
  id: string;                    // "roma-mercato-san-cosimato"
  name: string;                  // "Mercato di San Cosimato"
  kind: string;                  // "market" | "bar" | "landmark" | "trattoria" | ...
  neighbourhood: string;         // "Trastevere"
  real: boolean;                 // true for real landmarks (facts must be right, real photos)
}

interface CityPantry {
  id: string;                    // "roma"
  name: string;                  // "Roma"
  neighbourhoods: string[];      // ["Trastevere", "Monti", "Testaccio", ...]
  places: Place[];
  food: string[];                // ["supplì", "cacio e pepe", ...]
  customs: string[];             // ["Pay at the cassa first, then order at the bar", ...]
  localTouches: string[];        // ["daje", "aò"], used sparingly at A1–A2
  anchorIds: string[];           // ["rita", "giulia"]
  seedCharacters: string[];      // short briefs Claude may use ("Enzo, 60s, theatrical vegetable seller")
  dayTrips: string[];            // ["orvieto"]
}
```

A suggested route (`content/it/route.ts`) lists city ids in order, as inspiration for the director only.

### Suggestion

What the director (`/api/suggest`) returns each morning.

```typescript
interface Suggestion {
  id: string;
  kind: 'everyday' | 'evening' | 'cambia-aria' | 'lesson';
  placeId: string;               // existing or newly invented place
  characterId?: string;          // someone the learner knows…
  newCharacterBrief?: string;    // …or a brief for someone new ("a bookseller in her 50s")
  goal?: string[];               // 0–4 light steps; none for evening conversations
  why: string;                   // learning need it serves (for testing, never shown)
  caption: string;               // tile text in Italian: "Il bar di Giulia"
}
```

### Scene

What `/api/scene` creates from a suggestion or a "vai dove vuoi" request.

```typescript
interface Scene {
  id: string;                    // UUID
  suggestionId?: string;
  characterId: string;           // existing, or created in the same call
  setting: {
    place: string;               // "Il Bar di Giulia"
    timeOfDay: string;           // "morning, 8am"
    description: string;         // "Busy neighbourhood coffee bar, you stand at the counter"
  };
  goal?: string[];               // light steps, if any
  opening: {
    guide: string;               // what the first line should do: "greet them as a regular, mention yesterday"
    fallback: { it: string; en: string };  // used only if generating the opening fails
  };
  recycleWords?: string[];       // from the quaderno
  agenda?: {                     // evening conversations only
    topic: string;               // "Her art, why she loves drawing in piazzas"
    wantsToKnow: string[];       // ["What you find beautiful", "Why you came to Italy"]
    arcLength: number;           // 8–12 exchanges
  };
}
```

## Learner Data (Dynamic)

These are stored per learner, initially in localStorage, later in Postgres.

### Learner Profile

```typescript
type Level = 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface LearnerProfile {
  id: string;                    // UUID
  name: string;                  // "Josh"
  homeTown: string;              // "Chicago"
  whyItaly: string;              // "I love the language and culture..."
  level: Level;                  // current CEFR step, rises slowly
  levelEvidence: string[];       // recent signals ("used passato prossimo unprompted 4 times")
  createdAt: Date;

  settings: {
    showEnglish: boolean;        // true at A1, false at A2+
    slowSpeech: boolean;         // false by default
    dailyBudget?: number;        // Optional spending limit per day
  };
}
```

### Journey State

```typescript
interface JourneyState {
  learnerId: string;
  day: number;                   // in-game day count
  currentCity: string;           // "roma"
  neighbourhood: string;         // "Trastevere"
  daysInCity: number;            // 3
  citiesVisited: string[];       // ["roma"]
  todaySuggestions: Suggestion[];
  completedSceneIds: string[];
}
```

### Relationship Memory

Per learner, per character. Tracks what each character knows about you.

```typescript
interface Relationship {
  learnerId: string;
  characterId: string;           // "giulia"
  familiarity: Familiarity;      // "habitue" by day 3
  lastSeen: Date;

  memory: {
    facts: string[];             // ["Name is Josh", "From Chicago", "Orders cappuccino e cornetto"]
    promises: string[];          // ["Said he'd try the maritozzo next time"]
    topics: string[];            // ["Talked about why he loves Italy", "Asked about her career"]
  };
}
```

### Scene Run

A completed conversation, with full transcript.

```typescript
interface Turn {
  who: 'npc' | 'learner';
  transcript: string;            // What was said (learner) or generated (NPC)
  understood?: string;           // If significantly different from transcript
  translation?: string;          // English (if showEnglish was on)
}

interface SceneRun {
  id: string;                    // UUID
  learnerId: string;
  sceneId: string;               // "roma-bar-day1"
  characterId: string;           // "giulia"
  day: number;                   // 1
  startedAt: Date;
  completedAt?: Date;

  transcript: Turn[];
  stepsDone: number[];           // [0, 1, 2] - goal steps completed

  corrections: Array<{
    said: string;
    better: string;
    why: string;
  }>;

  wordsIntroduced: Array<{
    it: string;
    en: string;
  }>;
}
```

### Quaderno (Vocabulary)

All words and phrases the learner has encountered.

```typescript
interface Word {
  learnerId: string;
  it: string;                    // "vorrei"
  en: string;                    // "I would like"
  firstSeen: Date;
  lastUsed: Date;
  timesUsed: number;             // 3
  sceneIds: string[];            // Where it appeared
}
```

### Magda Message

```typescript
interface MagdaMessage {
  id: string;
  learnerId: string;
  reason: 'mistakes' | 'next-level' | 'before-hard-situation' | 'weekly';
  text: { it: string; en: string };   // the message on the in-game phone
  lessonFocus: string;                // "vorrei vs voglio"
  createdAt: Date;
  opened: boolean;
}
```

### Mistake Pattern

Recurring errors worth tracking for "try tomorrow" goals.

```typescript
interface Mistake {
  learnerId: string;
  pattern: string;               // "uses 'voglio' instead of 'vorrei'"
  category: string;              // "politeness" | "grammar" | "vocabulary"
  examples: Array<{
    said: string;
    better: string;
    sceneId: string;
    day: number;
  }>;
  count: number;                 // 3 - how many times repeated
  lastSeen: Date;
  resolved: boolean;             // false until stopped appearing
}
```

### Diario Entry

End-of-day summary and reflection.

```typescript
interface DiarioEntry {
  learnerId: string;
  day: number;                   // 1
  date: Date;

  summary: {
    it: string;                  // One-line summary in Italian
    en: string;                  // Translation
  };

  topCorrections: Array<{        // 2-3 most important corrections
    said: string;
    better: string;
    why: string;
    practice: string;            // Phrase to practice aloud
  }>;

  newWords: Array<{
    it: string;
    en: string;
  }>;

  tryTomorrow: string[];         // ["Use vorrei instead of voglio", "Practice numbers"]

  characterNote?: {              // Note from evening encounter character
    characterId: string;
    name: string;
    note: string;                // In Italian, 1-2 sentences
  };
}
```

## Turn Output Schema (API Response)

What `/api/turn` returns to the UI.

```typescript
interface TurnOutput {
  understood: string;            // Reconstructed Italian
  it: string;                    // Character's reply
  en: string;                    // Translation

  correction: {
    said: string;
    better: string;
    why: string;                 // Under 15 words
  } | null;

  words: Array<{
    it: string;
    en: string;
  }>;                            // 0-2 new words this turn

  steps_done: number[];          // Cumulative completed steps [0, 1]

  hint: string | null;           // Only when confused or requested
  confused: boolean;             // true only when genuinely didn't understand

  mood: Mood;                    // "warm" | "amused" | "curious" | "busy"
  scene_over: boolean;           // true when scene should end

  memory_notes: string[];        // Facts to remember about learner
}
```

## Storage Strategy

### M1: localStorage

```typescript
// Keys in localStorage
const KEYS = {
  profile: 'fuori:profile',
  journey: 'fuori:journey',
  characters: 'fuori:characters',   // generated characters
  magda: 'fuori:magda',
  relationships: 'fuori:relationships',
  scenes: 'fuori:scenes',
  quaderno: 'fuori:quaderno',
  mistakes: 'fuori:mistakes',
  diario: 'fuori:diario',
};

// Each stored as JSON
localStorage.setItem(KEYS.profile, JSON.stringify(learnerProfile));
```

### M4: Postgres

```sql
-- Tables
learners (id, name, home_town, why_italy, level, settings, created_at)
journey_state (learner_id, day, current_city, neighbourhood, days_in_city, cities_visited)
characters (id, learner_id, sheet, origin, created_at)
scenes (id, learner_id, character_id, scene, created_at)
magda_messages (id, learner_id, reason, text, lesson_focus, opened, created_at)
relationships (learner_id, character_id, familiarity, memory, last_seen)
scene_runs (id, learner_id, scene_id, day, transcript, corrections, completed_at)
words (learner_id, it, en, first_seen, last_used, times_used, scene_ids)
mistakes (learner_id, pattern, category, examples, count, last_seen, resolved)
diario_entries (learner_id, day, summary, corrections, new_words, try_tomorrow, character_note)
```

**Migration path:**
- Read from localStorage
- POST to `/api/migrate` endpoint
- Write to Postgres
- Clear localStorage
- Future reads/writes go to DB

## Validation

Use Zod schemas for all types, especially for API boundaries:

```typescript
import { z } from 'zod';

export const TurnOutputSchema = z.object({
  understood: z.string(),
  it: z.string(),
  en: z.string(),
  correction: z.object({
    said: z.string(),
    better: z.string(),
    why: z.string().max(100),
  }).nullable(),
  words: z.array(z.object({
    it: z.string(),
    en: z.string(),
  })).max(2),
  steps_done: z.array(z.number()),
  hint: z.string().nullable(),
  confused: z.boolean(),
  mood: z.enum(['warm', 'amused', 'curious', 'busy']),
  scene_over: z.boolean(),
  memory_notes: z.array(z.string()),
});

export type TurnOutput = z.infer<typeof TurnOutputSchema>;
```

Use with Claude's structured outputs (`output_config.format`) via the SDK's `messages.parse()`, so the response is validated against the schema. Check the current Anthropic SDK docs for the exact helper that converts a Zod schema; these details change.

## Sample Data

For testing and development, create sample data files:

- `content/it/characters/__fixtures__/giulia-day1.json` - Sample conversation transcript
- `content/it/__fixtures__/suggestions-roma-day3.json` - Sample director output
- `content/learners/__fixtures__/josh.json` - Sample learner profile
- `content/relationships/__fixtures__/josh-giulia.json` - Sample relationship after 3 days

This allows testing UI components without API calls and provides examples for new developers.
