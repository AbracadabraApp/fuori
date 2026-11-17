# Data Model

Hand-written content (city pantries and their people, Magda, level rules, prompts) lives in the repo as TypeScript, JSON and Markdown files under `content/<country>/` (`content/it/`, `content/es-mx/`; one folder per country pack). Everything generated during play and all learner progress is learner data, stored in Railway Postgres (from M1; see [Storage Strategy](#storage-strategy)). Generating characters, scenes and suggestions during play is not built yet; today every character but Magda comes from the city files.

The types are in `lib/types.ts`. Those marked *not built* below are there but unused.

## Content Types

Hand-written ones live in `content/<country>/`, committed to the repo. Generated characters and scenes use the same shapes and are stored with learner data.

### Character Sheet

```typescript
type Mood = 'warm' | 'amused' | 'curious' | 'busy';
type Formality = 'formal' | 'informal';  // each language's words for them are in its language.ts (Lei / tu, usted / tú)
type Pace = 'slow' | 'normal' | 'quick';
type Familiarity = 'sconosciuto' | 'cliente' | 'habitue' | 'amico';

interface CharacterSheet {
  id: string;                    // "giulia", "rita"
  name: string;                  // "Giulia"
  age: number;                   // 32
  role: string;                  // "barista"
  city: string;                  // "Roma"
  origin: 'generated' | 'tutor'; // from the city files or created during play, or Magda (anchors removed 2026-10-16)
  placeId?: string;              // where you meet them ("roma-bar-giulia")

  personality: {
    traits: string[];            // ["quick", "funny", "warm"]
    caresAbout: string[];        // ["good coffee", "neighborhood gossip", "her regulars"]
    secret?: string;             // "Wants to open her own place someday"
  };

  speech: {
    formality: Formality;        // "informal" - switches based on familiarity
    pace: Pace;                  // "quick" - affects TTS speed in UI
    regionalisms: string[];      // ["anvedi", "daje"] for Romans
    description: string;         // "Fast-talking, informal, lots of questions"
  };

  englishAbility?: 'fluent' | 'basic' | 'none';
  gender?: 'f' | 'm';            // picks a male or female voice

  appearance: {
    description: string;         // "Italian woman in her early 30s, dark curly hair..."
    setting: string;             // "Behind the counter of a small Roman coffee bar"
  };

  portrait: {
    kind: 'illustrated' | 'svg' | 'placeholder';
    prompt?: string;             // Image prompt for illustrated portraits (see Visuals)
    avatarSeed?: string;         // Drives the SVG avatar (age, hair, skin, colours) so it stays consistent
  };
}
```

The only hand-written `CharacterSheet` is Magda (`content/<country>/characters/magda.ts`, `origin: 'tutor'`). Everyone else is a `CityCharacter` in the city files:

```typescript
interface CityCharacter {
  id: string;
  name: string;
  gender: 'f' | 'm';
  age: number;
  role: string;
  placeId: string;
  personality: string[];
  portraitPrompt: string;
  here?: string;                 // why they're at the place, one line to them ("You work the counter here between lectures")
  voice?: string;                // their ElevenLabs voice, assigned once per city (npm run voices:assign)
}
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
  characterId?: string;
  imagePrompt?: string;
  hidden?: boolean;              // not shown in the feed (content/it/showcase.ts)
  menu?: string[];               // a food place's menu, shown over its picture
  menuBoard?: { x: number; y: number; width: number; height: number };
  pictures?: { id: string; shows: string; imagePrompt: string }[];
}

interface CityPantry {
  id: string;                    // "roma"
  name: string;                  // "Roma"
  region?: string;               // shown under the city name in the feed
  neighbourhoods: string[];      // ["Trastevere", "Monti", "Testaccio", ...]
  places: Place[];
  characters?: CityCharacter[];  // the city's people (above)
  food: string[];                // ["supplì", "cacio e pepe", ...]
  customs: string[];             // ["Pay at the cassa first, then order at the bar", ...]
  localTouches: string[];        // ["daje", "aò"], used sparingly at A1–A2
  seedCharacters?: string[];     // short briefs Claude may use ("Enzo, 60s, theatrical vegetable seller")
  dayTrips?: string[];           // ["orvieto"]
  hidden?: boolean;              // not shown anywhere
  more?: boolean;                // after "Mostra altro" in the city list
}
```

A suggested route (planned as `content/it/route.ts`, as inspiration for the director) doesn't exist; the feed order is in `content/<country>/cities/index.ts`.

### Suggestion (not built)

What the director (`/api/suggest`, not built) would return each morning.

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

### Scene (not built)

What `/api/scene` (not built) would create from a suggestion or a "vai dove vuoi" request.

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

These are stored per learner in Postgres. What's built is in [Storage Strategy](#storage-strategy); the interfaces below are the original design, and those marked *not built* arrive with the features that need them.

### Learner Profile (not built as such)

Built instead: columns on `learners` (below): `level` (beginner, intermediate, advanced), `step`, `addressed_as`, the onboarding record. The app's display settings stay on the phone.

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

### Journey State (not built)

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

### Relationship Memory (not built)

*The fuller M2 version.* What's built is the minimal `character_memories` table below (visit count and short notes); M2 adds familiarity levels (sconosciuto → amico, Lei → tu) and structured facts, promises and topics.

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

### Scene Run (not built)

A completed conversation, with full transcript. Built instead: the `conversations` table (below).

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

### Quaderno (Vocabulary) (not built)

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

### Magda Message (not built)

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

### Mistake Pattern (not built)

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

### Diario Entry (not built)

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

What Claude returns for a character's turn (`lib/prompts/turn-output-schema.ts`; the `TurnOutput` type in `lib/types.ts`). Deliberately simple: corrections, help and mood happen in the conversation itself.

```typescript
interface TurnOutput {
  line: string;                  // what the character says, in the language being learned
  en: string;                    // its English
  done?: boolean;                // this reply ends the conversation (they left, the character said goodbye)
  hard?: boolean;                // their last line asked for help or said it's hard
  parts?: Part[];                // Beginner: the turn in parts; `line` is them all, in order
  question?: { text: string; en: string };  // Beginner 2: the question that ends the reply
  idiom?: string;                // the idiom this reply used (lib/idioms.ts)
  tapAnswers?: boolean;          // the welcome's opening: answers are buttons
  canEnd?: boolean;              // the welcome after the tap: the end button shows
}
```

`/v1/turn` returns `{ line, en, conversationId, promptVersion, replies, stage }` to the app (`app/v1/turn/route.ts`).

## Storage Strategy

Decided 2026-10-10: learner data lives in **Railway Postgres from M1**, not localStorage. Why: Safari erases site storage after ~7 days without a visit, the server needs memory for messages, and a database can be inspected. See [Architecture → Where learner data lives](05-architecture.md#where-learner-data-lives-decided-2026-10-10).

### What's built

`scripts/db-migrate.mjs` creates the tables; several also create themselves on first use, so they ship without a manual migration. One database is shared by both countries' servers; tables that need it have a `country` column.

```sql
-- One row per learner (per country: each country's server makes its own learner for a device)
learners (
  id                 uuid primary key,
  created_at         timestamptz not null default now(),
  level              text,          -- beginner, intermediate, advanced; null until placed
  onboarded_at       timestamptz,
  onboarding         jsonb,         -- what they said and why they were placed there
  level_checks       jsonb,         -- the level check after the first conversations (lib/learner-level.ts)
  addressed_as       text,          -- 'f' or 'm'; null until they say
  addressed_from     text,          -- how it was learned ('chose')
  step               int not null default 1,  -- Beginner step (lib/level-up.ts)
  step_since         timestamptz,
  level_up_asked_at  timestamptz,
  scaffold_from      timestamptz    -- scaffolding counts only conversations after this
)

-- The app's sign-in: one bearer token per device, stored only as a SHA-256 hash
learner_tokens (token_hash text primary key, learner_id uuid, created_at, last_used_at)

-- What each character remembers about each learner.
character_memories (
  learner_id    uuid references learners(id),
  character_id  text,            -- 'antonio-russo', ..., or 'magda' for her study file
  visits        int not null default 0,
  last_visit    timestamptz,
  notes         text[] not null default '{}',  -- short, written by Claude after each conversation
  primary key (learner_id, character_id)
)

-- Each conversation, kept so it can be reviewed (by Magda, and by us
-- to judge conversation quality). Added 2026-10-11.
conversations (
  id              uuid primary key,
  learner_id      uuid references learners(id),
  character_id    text,
  place_id        text,
  city_id         text,
  prompt_version  text,
  started_at      timestamptz not null,
  ended_at        timestamptz,
  turns           jsonb not null,  -- [{ who, text, en?, at, parts?, ms? }] (ConversationTurn, lib/memory.ts)
  review          jsonb,           -- learning notes written when it ends: 2–3 things worth learning, real mistakes (said / better), phrases not understood, English fallbacks
  reviewed_at     timestamp,
  analysis        jsonb,           -- unused since 2026-10-14 (the per-conversation M2 "Review", replaced by Magda's study file)
  memory_turns    int not null default 0,  -- turns already written into memory (written once per new stretch of talk)
  memory_at_start jsonb,           -- what the character remembered when it started (same {relationship} for every turn)
  quality         jsonb,           -- the dialogue scorecard (lib/quality.ts)
  quality_history jsonb not null default '[]'  -- earlier scores, oldest first
)

-- Counts per conversation for scaffolding and level up (lib/conversation-record.ts)
conversation_records (conversation_id, learner_id, country, at, character_id, prompt_version, learner_turns, words, …, step, stage, felt, moved, state, reply_ranks)

-- Tools and debugging
app_errors    -- errors from the app (/v1/log; lib/app-errors.ts)
turn_ratings  -- turns rated from the debug panel (/v1/rate; lib/turn-ratings.ts)
say_it_log    -- every "How do I say it" decision (lib/say-it-log.ts)
```

Nothing is deleted with a learner (Josh, 2026-11-10: "we shouldn't delete"): a learner with conversations or character memories can't be deleted until those are removed on purpose. Sign-in tokens still go with the learner.

No audio is kept in the database. Recordings of learners listed in `KEEP_RECORDINGS_FOR` are kept 30 days in a private R2 bucket (`lib/speech/keep-recording.ts`).

**Flow:**
1. Opening a conversation loads that character's row (if any). The visit count and notes go into the character's prompt ("You've met them 3 times. You remember: their name is Josh; from Seattle; always orders a cappuccino").
2. Each turn is saved to the conversation's row as it happens, so nothing is lost if the screen closes.
3. When the conversation ends (leaving the screen after at least a few exchanges; the app calls `/v1/conversations/{id}/end`), one Claude call reads the transcript and writes two things: updated notes for the character (keep what matters, drop what doesn't, at most ~10 short lines; `visits` goes up by one) and the learning notes (the review log). Then a small call folds those learning notes into Magda's study file: her `character_memories` row (`character_id` = the pack's tutor, `magda`), up to ~20 lines, cumulative, not shown to the learner. Its `visits` counts lessons only. A lesson with Magda updates the study file again when it ends. See [Game design → The study file](02-game-design.md#the-learner-profile-is-magdas-the-study-file).

### Later milestones

Added when the features that need them are built:

```sql
learners            -- + name, home_town, settings (email sign-in was cut: 12-native-app.md decision 3)
journey_state       (learner_id, day, current_city, neighbourhood, days_in_city, cities_visited)
characters          (id, learner_id, sheet, origin, created_at)       -- generated characters
scenes              (id, learner_id, character_id, scene, created_at)
character_memories  -- + familiarity, structured facts / promises / topics (M2)
magda_messages      (id, learner_id, reason, text, lesson_focus, opened, created_at)
scene_runs          (id, learner_id, scene_id, day, transcript, completed_at)
words               (learner_id, it, en, first_seen, last_used, times_used, scene_ids)
mistakes            (learner_id, pattern, category, examples, count, last_seen, resolved)
diario_entries      (learner_id, day, summary, corrections, new_words, try_tomorrow, character_note)
```

The app's display settings and the debug switch stay on the phone; nothing that matters if lost.

## Validation

Every Claude call that returns data passes a JSON schema in `output_config.format` (structured outputs), so the response comes back in that shape. The schemas are in `lib/prompts/*-output-schema.ts` (`turn-output-schema.ts`, `memory-output-schema.ts`, `learn-output-schema.ts`…). Where the code checks the result again, it uses Zod (for example `lib/turn.ts`).

## Sample Data

Planned, not made: sample data files for testing and development:

- `content/it/characters/__fixtures__/giulia-day1.json` - Sample conversation transcript
- `content/it/__fixtures__/suggestions-roma-day3.json` - Sample director output
- `content/learners/__fixtures__/josh.json` - Sample learner profile
- `content/relationships/__fixtures__/josh-giulia.json` - Sample relationship after 3 days

This allows testing UI components without API calls and provides examples for new developers.
