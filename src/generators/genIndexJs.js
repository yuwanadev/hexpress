'use strict';

function genIndexJs(port = 3000) {
  return `import { app } from './src/app.js';

const PORT = process.env.PORT ?? ${port};

const server = app.listen(PORT, () => {
  console.log(\`[Server] Listening on port \${PORT}\`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('[Server] Gracefully shut down');
    process.exit(0);
  });
});
`;
}

module.exports = { genIndexJs };
