'use strict';

function genCtn(type) {
  return `import { pool } from '../../../config/database.js';

/**
 * registerModules
 * @param {import('express').Router} router
 */
export function registerModules(router) {
  // compose${type === 'modular-monolith' ? 'ExampleModule' : 'Example'}({ pool, router });
}
`;
}

module.exports = { genCtn };
