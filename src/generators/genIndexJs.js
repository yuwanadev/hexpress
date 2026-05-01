'use strict';

function genIndexJs(port = 3000) {
  return `import { App } from './src/app.js';
import { closePool } from './src/config/database.js';

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled Rejection:', reason);
  process.exit(1);
});

const app = new App();
const server = app.listen();

process.on('SIGTERM', () => {
  server.close(async () => {
    await closePool();
    console.log('[Server] Gracefully shut down');
    process.exit(0);
  });
});
`;
}

module.exports = { genIndexJs };
