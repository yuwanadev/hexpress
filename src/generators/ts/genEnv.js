'use strict';

function genEnv(port = 3000, type = 'modular-monolith') {
  const base = [
    `APP_NAME=hexpress-app`,
    `APP_VERSION=1.0.0`,
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
    ``,
    `# ── Redis ─────────────────────────────────────────────────────────────────────`,
    `REDIS_HOST=localhost`,
    `REDIS_PORT=6379`,
    `REDIS_PASSWORD=`,
    `REDIS_DB=0`,
    `REDIS_CONNECT_TIMEOUT=5000`,
    ``,
    `# ── OpenTelemetry ─────────────────────────────────────────────────────────────`,
    `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces`,
    `OTEL_SERVICE_VERSION=1.0.0`,
  ].join('\n') + '\n';

  if (type === 'microservice') {
    return base + `\n# ── Kafka ─────────────────────────────────────────────────────────────────────\nKAFKA_BROKERS=localhost:9092\nKAFKA_CLIENT_ID=${port}\n`;
  }
  return base;
}

module.exports = { genEnv };
