'use strict';

const path   = require('path');
const { pascal, kebab } = require('../utils/names');

/**
 * Resolves absolute file paths for each artefact, given project type and scope.
 *
 * Monolith:     every path is under  src/modules/<module>/
 * Microservice: every path is under  src/  (flat — no module wrapper)
 */
function resolvePaths(root, type, scopeName, featureName) {
  const Name    = pascal(featureName);
  const base    = type === 'modular-monolith'
    ? path.join(root, 'src', 'modules', kebab(scopeName))
    : path.join(root, 'src');

  return {
    // domain
    entity:       path.join(base, 'domain', 'entities',  `${Name}.js`),
    domainEvent:  (evtName) => path.join(base, 'domain', 'events',  `${pascal(evtName)}.js`),
    domainError:  (errName) => path.join(base, 'domain', 'errors',  `${pascal(errName)}.js`),

    // application
    inboundPort:  path.join(base, 'application', 'ports', 'inbound',  `${Name}Port.js`),
    outboundPort: path.join(base, 'application', 'ports', 'outbound', `${Name}DatabasePort.js`),
    dto:          path.join(base, 'application', 'ports', 'dtos',     `${Name}DTO.js`),
    useCase:      path.join(base, 'application', 'use-cases',         `${Name}UseCase.js`),

    // infrastructure
    controller:   path.join(base, 'infrastructure', 'adapters', 'inbound',  'http',        `${Name}Controller.js`),
    repository:   path.join(base, 'infrastructure', 'adapters', 'outbound', 'persistence', `${Name}Repository.js`),

    // wiring
    wiring: type === 'modular-monolith'
      ? path.join(base, `${kebab(scopeName)}.module.js`)
      : path.join(root, 'src', `${kebab(featureName)}.wiring.js`),

    // shared
    middleware:   path.join(root, 'src', 'shared', 'middlewares', `${Name}Middleware.js`),

    // display relative to root
    rel: (p) => path.relative(root, p),
    base,
  };
}

/**
 * Resolve wiring/module path for an existing scope (no feature name needed).
 */
function resolveWiringPath(root, type, scopeName) {
  if (type === 'modular-monolith') {
    return path.join(root, 'src', 'modules', kebab(scopeName), `${kebab(scopeName)}.module.js`);
  }
  return path.join(root, 'src', 'wiring.js');
}

module.exports = { resolvePaths, resolveWiringPath };
