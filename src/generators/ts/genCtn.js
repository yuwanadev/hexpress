'use strict';

function genCtn(type) {
  return `import type { Router } from "express";
import pool from "../../../config/database";

export function registerModules(router: Router): void {
  // compose${type === 'modular-monolith' ? 'ExampleModule' : 'Example'}({ pool, router });
}
`;
}

module.exports = { genCtn };
