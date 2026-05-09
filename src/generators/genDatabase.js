'use strict';

function genDatabase() {
  return `import pg from 'pg';

const { Pool } = pg;

/**
 * @type {import('pg').Pool}
 */
export let pool;

/**
 * Convenience wrapper — runs a single query against the pool.
 *
 * @param {string} text   SQL query string
 * @param {any[]}  params Parameterised values
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  if (!pool) throw new Error('[Database] Pool not initialised. Call connectDatabase(config) first.');
  return pool.query(text, params);
}

/**
 * Obtain a dedicated client from the pool (for transactions).
 * Remember to call client.release() when you are done.
 *
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  if (!pool) throw new Error('[Database] Pool not initialised. Call connectDatabase(config) first.');
  return pool.connect();
}

/**
 * Connect to database. Call once at application startup.
 * 
 * @param {import('./index.js').AppConfig} config
 * @returns {Promise<void>}
 */
export async function connectDatabase(config) {
  pool = new Pool({
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

  pool.on('error', (err) => {
    console.error('[DB Pool] Unexpected error on idle client', err);
  });

  try {
    await pool.query('SELECT 1');
    console.log(\"[Database] Connected\");
  } catch (err) {
    throw new Error(\"[Database] Connection failed for \".concat(err, "\"));
  }
}

/**
 * Gracefully drain the pool (call on SIGTERM / app shutdown).
 *
 * @returns {Promise<void>}
 */
export async function disconnectDatabase() {
  if (pool) {
    await pool.end();
    console.log('[Database] Disconnected');
  }
}
`;
}

module.exports = { genDatabase };
