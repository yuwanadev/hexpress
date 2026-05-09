'use strict';

function genDatabase() {
  return `import pg from 'pg';
import type { QueryResult, PoolClient, Pool } from 'pg';
import type { AppConfig } from './index';

const { Pool: PoolConstructor } = pg;

export let pool: Pool;

/**
 * Convenience wrapper — runs a single query against the pool.
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  if (!pool) throw new Error('[Database] Pool not initialised. Call connectDatabase(config) first.');
  return pool.query(text, params);
}

/**
 * Obtain a dedicated client from the pool (for transactions).
 * Remember to call client.release() when you are done.
 */
export async function getClient(): Promise<PoolClient> {
  if (!pool) throw new Error('[Database] Pool not initialised. Call connectDatabase(config) first.');
  return pool.connect();
}

/**
 * Connect to database. Call once at application startup.
 */
export async function connectDatabase(config: AppConfig): Promise<void> {
  pool = new PoolConstructor({
    host:     config.db.host,
    port:     config.db.port,
    database: config.db.database,
    user:     config.db.user,
    password: config.db.password,

    // Pool behaviour
    min:                    config.db.pool.min,
    max:                    config.db.pool.max,
    idleTimeoutMillis:      config.db.pool.idleTimeoutMillis,
    connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis,
  });

  pool.on('error', (err: Error) => {
    console.error('[DB Pool] Unexpected error on idle client', err);
  });

  await pool.query('SELECT 1');
  console.log('[Database] Connected');
}

/**
 * Gracefully drain the pool (call on SIGTERM / app shutdown).
 */
export async function disconnectDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('[Database] Disconnected');
  }
}
`;
}

module.exports = { genDatabase };
