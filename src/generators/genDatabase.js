'use strict';

function genDatabase() {
  return `import pg from 'pg';
import config from './index.js';

const { Pool } = pg;

/**
 * Database connection pool.
 *
 * Uses the centralised config object so no file needs to touch process.env
 * directly. The pool is created once and shared across the application.
 *
 * @see https://node-postgres.com/apis/pool
 */
const pool = new Pool({
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

// Emit a log on unexpected errors so connections are not silently lost
pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client', err);
});

/**
 * Convenience wrapper — runs a single query against the pool.
 *
 * @param {string} text   SQL query string
 * @param {any[]}  params Parameterised values
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Obtain a dedicated client from the pool (for transactions).
 * Remember to call client.release() when you are done.
 *
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Gracefully drain the pool (call on SIGTERM / app shutdown).
 */
export async function closePool() {
  await pool.end();
}

export default pool;
`;
}

module.exports = { genDatabase };
