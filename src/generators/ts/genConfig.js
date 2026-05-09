'use strict';

function genConfig(port = 3000, type = 'modular-monolith') {
  const kafka = type === 'microservice'
    ? `\n\n  kafka: {\n    brokers: (env.KAFKA_BROKERS ?? 'localhost:9092').split(','),\n    clientId: env.KAFKA_CLIENT_ID ?? 'my-service',\n  },`
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

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  connectTimeout: number;
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
  app: {
    name: string;
    version: string;
  };
  telemetry: {
    endpoint: string;
  };
  db: DbConfig;
  redis: RedisConfig;
  ${type === 'microservice' ? 'kafka: { brokers: string[]; clientId: string };' : ''}
}

const config: AppConfig = Object.freeze({
  env: env.NODE_ENV ?? 'development',
  port: parseInt(env.PORT ?? '${port}', 10),
  logLevel: env.LOG_LEVEL ?? 'info',

  app: {
    name:    env.APP_NAME    ?? 'hexpress-app',
    version: env.APP_VERSION ?? '1.0.0',
  },

  telemetry: {
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
  },

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

  redis: {
    host:           env.REDIS_HOST            ?? 'localhost',
    port:           parseInt(env.REDIS_PORT   ?? '6379', 10),
    password:       env.REDIS_PASSWORD        ?? '',
    db:             parseInt(env.REDIS_DB     ?? '0', 10),
    connectTimeout: parseInt(env.REDIS_CONNECT_TIMEOUT ?? '5000', 10),
  },
  ${kafka}
});

export default config;
`;
}

module.exports = { genConfig };
