'use strict';

function genRedis() {
  return `import { createClient } from 'redis';

/**
 * @type {import('redis').RedisClientType}
 */
export let client;

/**
 * Connect to Redis. Call once at application startup before any cache ops.
 * @param {import('./index.js').AppConfig} config
 * @returns {Promise<void>}
 */
export async function connectRedis(config) {
  client = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
      connectTimeout: config.redis.connectTimeout,
    },
    password: config.redis.password || undefined,
    database: config.redis.db,
  });

  client.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') return;
    console.error('[Redis] Client error', err);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected');
  });

  client.on('reconnecting', () => {
    console.warn('[Redis] Reconnecting...');
  });

  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    console.error('[Redis] Connection failed:', err.message);
  }
}

/**
 * Gracefully disconnect. Call on SIGTERM / app shutdown.
 * @returns {Promise<void>}
 */
export async function disconnectRedis() {
  if (client && client.isOpen) {
    await client.quit();
    console.log('[Redis] Disconnected');
  }
}
`;
}

module.exports = { genRedis };
