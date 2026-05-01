'use strict';

function genEnv(port = 3000, type = 'modular-monolith') {
  const base = [
    `NODE_ENV=development`,
    `PORT=${port}`,
    `LOG_LEVEL=info`,
    ``,
    `# ── Database ──────────────────────────────────────────────────────────────────`,
    `DB_HOST=localhost`,
    `DB_PORT=5432`,
    `DB_NAME=mydb`,
    `DB_USER=postgres`,
    `DB_PASSWORD=`,
    ``,
    `# ── Connection Pool ───────────────────────────────────────────────────────────`,
    `DB_POOL_MIN=2`,
    `DB_POOL_MAX=10`,
    `DB_POOL_IDLE_TIMEOUT=30000`,
    `DB_POOL_CONN_TIMEOUT=5000`,
  ].join('\n') + '\n';

  if (type === 'microservice') {
    return base + `\n# ── Kafka ─────────────────────────────────────────────────────────────────────\nKAFKA_BROKERS=localhost:9092\nKAFKA_CLIENT_ID=${port}\n`;
  }
  return base;
}

module.exports = { genEnv };
