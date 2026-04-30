'use strict';

function genAppTs(type) {
  return `import express from 'express';
import { errorHandler } from './shared/infrastructure/http/errorHandler.js';
// import { compose${type === 'modular-monolith' ? 'ExampleModule' : 'Example'} } from '${type === 'modular-monolith' ? './modules/example/example.module' : './wiring'}.js';

const app    = express();
const router = express.Router();

app.use(express.json());
app.use('/api', router);

// ── Register modules ──────────────────────────────────────────────────────
// compose${type === 'modular-monolith' ? 'ExampleModule' : 'Example'}({ model, router });

app.use(errorHandler);

export { app };
`;
}

module.exports = { genAppTs };
