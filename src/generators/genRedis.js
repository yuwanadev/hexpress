'use strict';

function genRedis() {
  return `import { createClient } from 'redis';
import config from './index.js';

const client = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    connectTimeout: config.redis.connectTimeout,
  },
  password: config.redis.password || undefined,
  database: config.redis.db,
});

client.on('error', (err) => {
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
 * @returns {Promise<void>}
 */
export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

/**
 * Gracefully disconnect. Call on SIGTERM / app shutdown.
 * @returns {Promise<void>}
 */
export async function disconnectRedis() {
  if (client.isOpen) {
    await client.quit();
  }
}

export default client;
`;
}

module.exports = { genRedis };
