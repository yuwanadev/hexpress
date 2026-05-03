'use strict';

function genConfig(port = 3000, type = 'modular-monolith') {
  const kafka = type === 'microservice'
    ? `

  kafka: {
    brokers: (env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    clientId: env.KAFKA_CLIENT_ID ?? 'my-service',
  },`
    : '';

  return `import 'dotenv/config';

const env = process.env;

/**
 * @typedef {Object} DbPoolConfig
 * @property {number} min
 * @property {number} max
 * @property {number} idleTimeoutMillis
 * @property {number} connectionTimeoutMillis
 */

/**
 * @typedef {Object} DbConfig
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 * @property {DbPoolConfig} pool
 */

/**
 * @typedef {Object} ClientConfig
 * @property {string} [username]
 * @property {string} [password]
 * @property {string} [secret]
 * @property {string} [url]
 * @property {number} [port]
 * @property {number} [timeout]
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} env
 * @property {number} port
 * @property {string} logLevel
 * @property {DbConfig} db${type === 'microservice' ? '\n * @property {{ brokers: string[], clientId: string }} kafka' : ''}
 */

/** @type {AppConfig} */
const config = Object.freeze({
  env: env.NODE_ENV ?? 'development',
  port: parseInt(env.PORT ?? '${port}', 10),
  logLevel: env.LOG_LEVEL ?? 'info',

  db: {
    host:     env.DB_HOST     ?? 'localhost',
    port:     parseInt(env.DB_PORT ?? '5432', 10),
    database: env.DB_NAME     ?? 'mydb',
    user:     env.DB_USER     ?? 'postgres',
    password: env.DB_PASSWORD ?? '',

    // Connection pool
    pool: {
      min:                parseInt(env.DB_POOL_MIN  ?? '2', 10),
      max:                parseInt(env.DB_POOL_MAX  ?? '10', 10),
      idleTimeoutMillis:  parseInt(env.DB_POOL_IDLE_TIMEOUT ?? '30000', 10),
      connectionTimeoutMillis: parseInt(env.DB_POOL_CONN_TIMEOUT ?? '5000', 10),
    },
  },
  ${kafka}
});

export default config;
`;
}

module.exports = { genConfig };
