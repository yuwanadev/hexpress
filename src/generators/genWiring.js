'use strict';

const { pascal, camel } = require('../utils/names');

function genWiring(name, type) {
  const Name = pascal(name);
  const var_ = camel(name);

  if (type === 'microservice') {
    return `import { ${Name}UseCase }    from './application/use-cases/${Name}UseCase.js';
import { ${Name}Repository } from './infrastructure/adapters/outbound/persistence/${Name}Repository.js';
import { ${Name}Controller } from './infrastructure/adapters/inbound/http/${Name}Controller.js';

/**
 * compose${Name} — Dependency Injection Wiring
 *
 * Binds ports to adapters. This is the ONLY place that knows
 * which concrete class implements which interface.
 *
 * @param {{ pool: import('pg').Pool, router: import('express').Router }} deps
 */
export function compose${Name}({ pool, router }) {
  // Outbound: persistence adapter → injected into use case
  const ${var_}Db         = new ${Name}Repository(pool);

  // Application: use case implements inbound port, receives outbound port
  const ${var_}UseCase    = new ${Name}UseCase(${var_}Db);

  // Inbound: controller receives use case (via inbound port interface)
  const ${var_}Controller = new ${Name}Controller(${var_}UseCase);

  // Register HTTP routes
  ${var_}Controller.registerRoutes(router);

  return { ${var_}UseCase, ${var_}Controller };
}
`;
  }

  // modular-monolith
  return `import { ${Name}UseCase }    from './application/use-cases/${Name}UseCase.js';
import { ${Name}Repository } from './infrastructure/adapters/outbound/persistence/${Name}Repository.js';
import { ${Name}Controller } from './infrastructure/adapters/inbound/http/${Name}Controller.js';

/**
 * compose${Name}Module — Dependency Injection Wiring
 *
 * Binds ports to adapters for the ${Name} module.
 * Import and call this from your root app.js.
 *
 * @param {{ pool: import('pg').Pool, router: import('express').Router }} deps
 */
export function compose${Name}Module({ pool, router }) {
  const ${var_}Db         = new ${Name}Repository(pool);
  const ${var_}UseCase    = new ${Name}UseCase(${var_}Db);
  const ${var_}Controller = new ${Name}Controller(${var_}UseCase);

  ${var_}Controller.registerRoutes(router);

  return { ${var_}UseCase, ${var_}Controller };
}
`;
}

module.exports = { genWiring };
