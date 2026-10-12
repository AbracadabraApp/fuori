/**
 * Postgres connection for learner data
 *
 * M1 stores learners, character memories, and conversation transcripts.
 * Connection pooling handles concurrent requests; queries run through this utility.
 */

import { Pool, QueryResultRow } from 'pg';

let pool: Pool | null = null;

/**
 * Get or create the connection pool.
 * Safe to call multiple times - returns the same pool.
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      // No SSL inside Railway's private network or for a local database (tests, dev)
      ssl: /railway\.internal|localhost|127\.0\.0\.1|sslmode=disable/.test(connectionString) ? false : { rejectUnauthorized: false },
      max: 20, // maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Log connection errors but don't crash
    pool.on('error', (err) => {
      console.error('[db] Unexpected pool error:', err);
    });
  }

  return pool;
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Execute a query with parameters.
 * Returns the full result object from pg.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  const pool = getPool();
  return pool.query<T>(text, params);
}

/**
 * Check if the database connection works
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (err) {
    console.error('[db] Health check failed:', err);
    return false;
  }
}
