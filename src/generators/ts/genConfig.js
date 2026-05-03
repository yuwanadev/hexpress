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

export interface DbPoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  pool: DbPoolConfig;
}

export interface ClientConfig {
  url?: string;
  port?: number;
  timeout?: number;
  username?: string;
  password?: string;
  secret?: string;
}

export interface AppConfig {
  env: string;
  port: number;
  logLevel: string;
  db: DbConfig;${type === 'microservice' ? '\n  kafka: { brokers: string[]; clientId: string };' : ''}
}

const config: AppConfig = Object.freeze({
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
