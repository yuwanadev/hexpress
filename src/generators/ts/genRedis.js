'use strict';

function genRedis() {
  return `import { createClient, RedisClientType } from 'redis';
import config from './index';

const client: RedisClientType = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    connectTimeout: config.redis.connectTimeout,
  },
  password: config.redis.password || undefined,
  database: config.redis.db,
}) as RedisClientType;

client.on('error', (err: Error) => {
  console.error('[Redis] Client error', err);
});

client.on('connect', () => {
  console.log('[Redis] Connected');
});

client.on('reconnecting', () => {
  console.warn('[Redis] Reconnecting...');
});

/**
 * Connect to Redis. Call once at application startup before any cache ops.
 */
export async function connectRedis(): Promise<void> {
  if (!client.isOpen) {
    await client.connect();
  }
}

/**
 * Gracefully disconnect. Call on SIGTERM / app shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (client.isOpen) {
    await client.quit();
  }
}

export default client;
`;
}

module.exports = { genRedis };
