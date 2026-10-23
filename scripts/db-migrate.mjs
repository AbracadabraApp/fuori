#!/usr/bin/env node
/**
 * Database schema migration for M1
 *
 * Creates the three M1 tables:
 * - learners: minimal (id, created_at)
 * - character_memories: visit count and notes per character
 * - conversations: full transcripts with review log
 *
 * Run with: node scripts/db-migrate.mjs
 * Or from Railway CLI: railway run node scripts/db-migrate.mjs
 */

import pg from 'pg';

const { Pool } = pg;

const schema = `
-- M1 minimal learner record
CREATE TABLE IF NOT EXISTS learners (
  id          uuid PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- What each character remembers about each learner
CREATE TABLE IF NOT EXISTS character_memories (
  learner_id    uuid REFERENCES learners(id) ON DELETE CASCADE,
  character_id  text NOT NULL,
  visits        int NOT NULL DEFAULT 0,
  last_visit    timestamptz,
  notes         text[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (learner_id, character_id)
);

-- Full conversation transcripts
CREATE TABLE IF NOT EXISTS conversations (
  id              uuid PRIMARY KEY,
  learner_id      uuid REFERENCES learners(id) ON DELETE CASCADE,
  character_id    text NOT NULL,
  place_id        text,
  city_id         text,
  prompt_version  text,
  started_at      timestamptz NOT NULL,
  ended_at        timestamptz,
  turns           jsonb NOT NULL,
  review          jsonb
);

-- How many of a conversation's turns have been written into character memory
-- (notes + review log), so memory is written once per new stretch of talk
-- (added 2026-10-12)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS memory_turns int NOT NULL DEFAULT 0;
-- What the character remembered when the conversation started (visits, last
-- visit, notes), so every turn of it gets the same {relationship} line
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS memory_at_start jsonb;

-- Dialogue scorecard numbers for the conversation (lib/quality.ts), written when it ends
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS quality jsonb;

-- M2: Review analysis (added 2026-10-13)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS review JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
-- The full Review is stored in its own column: "review" holds the short
-- review log written with memory, and the two must not overwrite each other
-- (added 2026-10-13)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS analysis JSONB;

-- The app's sign-in: one opaque bearer token per device, stored only as a
-- SHA-256 hash, so a database leak doesn't hand out working tokens. Deleting
-- the row revokes it (native app, 2026-10-15; docs/12-native-app.md)
CREATE TABLE IF NOT EXISTS learner_tokens (
  token_hash    text PRIMARY KEY,
  learner_id    uuid NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_learner_tokens_learner ON learner_tokens(learner_id);

-- Onboarding (2026-10-16, docs/onboarding-design.md): the level the greeter
-- placed them at (beginner, intermediate, advanced; null until placed), when
-- they finished, and what they said and why they were placed there, so
-- placement can be checked and re-run. Per country, like learners themselves.
ALTER TABLE learners ADD COLUMN IF NOT EXISTS level text;
ALTER TABLE learners ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;
ALTER TABLE learners ADD COLUMN IF NOT EXISTS onboarding jsonb;
-- The level check after the first conversations (lib/learner-level.ts), each with its reason
ALTER TABLE learners ADD COLUMN IF NOT EXISTS level_checks jsonb;
-- Whether characters address them as a woman ('f') or a man ('m'); null until
-- they say (2026-10-21: characters defaulted to the masculine with women).
-- Read by every character (character.md {person}), unlike per-character memory.
-- addressed_from: how it was learned ('chose' in onboarding or Settings; later
-- weaker signals may fill it, never over a choice).
ALTER TABLE learners ADD COLUMN IF NOT EXISTS addressed_as text CHECK (addressed_as IN ('f', 'm'));
ALTER TABLE learners ADD COLUMN IF NOT EXISTS addressed_from text;
-- Scaffolding counts only conversations started after this (lib/scaffold.ts);
-- null counts them all. Set to restart the reply buttons without deleting
-- conversations (Josh, 2026-10-22, for his own learners).
ALTER TABLE learners ADD COLUMN IF NOT EXISTS scaffold_from timestamptz;
-- Errors from the iPhone app (/v1/log), kept because Railway's log goes with
-- each deploy (lib/app-errors.ts, 2026-10-22). Every country's server writes here.
CREATE TABLE IF NOT EXISTS app_errors (
  id          bigserial PRIMARY KEY,
  at          timestamptz NOT NULL DEFAULT now(),
  country     text NOT NULL,
  learner_id  uuid,
  code        text NOT NULL,
  step        text NOT NULL,
  api_code    text,
  status      int,
  message     text NOT NULL,
  app_version text,
  os          text,
  context     jsonb
);
CREATE INDEX IF NOT EXISTS idx_app_errors_at ON app_errors(at DESC);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_learner ON conversations(learner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_character ON conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started ON conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_reviewed ON conversations(learner_id, reviewed_at DESC);
`;

async function migrate() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    // No SSL inside Railway's private network or for a local database (tests, dev)
    ssl: /railway\.internal|localhost|127\.0\.0\.1|sslmode=disable/.test(connectionString) ? false : { rejectUnauthorized: false },
  });

  try {
    console.log('Running M1 schema migration...');

    await pool.query(schema);

    console.log('✓ Migration complete');
    console.log('✓ Tables created: learners, character_memories, conversations');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('learners', 'character_memories', 'conversations')
      ORDER BY table_name
    `);

    console.log(`✓ Verified ${result.rows.length} tables:`);
    result.rows.forEach((row) => console.log(`  - ${row.table_name}`));
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
