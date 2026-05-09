'use strict';

function genIndexTs(port = 3000) {
  return `import config from "./src/config/index";
// ── OpenTelemetry must be initialised before any other imports ───────────────
import { initTelemetry, shutdownTelemetry } from "./src/config/telemetry";
initTelemetry(config);

import { App } from "./src/app";
import { connectDatabase, disconnectDatabase } from "./src/config/database";
import { connectRedis, disconnectRedis } from "./src/config/redis";

process.on("uncaughtException", (error: Error) => {
  console.error("[Server] Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[Server] Unhandled Rejection:", reason);
  process.exit(1);
});

// ── Connect Infrastructure before accepting traffic ───────────────────────────
await Promise.all([
  connectDatabase(),
  connectRedis(),
]);

const app = new App(config);
const server = app.listen();

process.on("SIGTERM", () => {
  server.close(async () => {
    await Promise.all([
      disconnectDatabase(),
      disconnectRedis(),
      shutdownTelemetry(),
    ]);
    console.log("[Server] Gracefully shut down");
    process.exit(0);
  });
});
`;
}

module.exports = { genIndexTs };
