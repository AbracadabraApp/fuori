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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_learner ON conversations(learner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_character ON conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started ON conversations(started_at DESC);
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
