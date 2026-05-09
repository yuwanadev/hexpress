'use strict';

function genRedis() {
  return `import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import type { AppConfig } from './index';

export let client: RedisClientType;

/**
 * Connect to Redis. Call once at application startup before any cache ops.
 */
export async function connectRedis(config: AppConfig): Promise<void> {
  client = createClient({
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

  if (!client.isOpen) {
    await client.connect();
  }
}

/**
 * Gracefully disconnect. Call on SIGTERM / app shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    console.log('[Redis] Disconnected');
  }
}
`;
}

module.exports = { genRedis };
