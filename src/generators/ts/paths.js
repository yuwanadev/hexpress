'use strict';

const path   = require('path');
const { pascal, kebab } = require('../../utils/names');

/**
 * Resolves absolute file paths for each artefact (TypeScript), given project type and scope.
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
    entity:       path.join(base, 'domain', 'entities',  `${Name}.ts`),
    domainEvent:  (evtName) => path.join(base, 'domain', 'events',  `${pascal(evtName)}.ts`),
    domainError:  (errName) => path.join(base, 'domain', 'errors',  `${pascal(errName)}.ts`),

    // application
    inboundPort:  path.join(base, 'application', 'ports', 'inbound',  `${Name}Port.ts`),
    outboundPort: path.join(base, 'application', 'ports', 'outbound', `${Name}DatabasePort.ts`),
    dto:          path.join(base, 'application', 'ports', 'dtos',     `${Name}DTO.ts`),
    useCase:      path.join(base, 'application', 'use-cases',         `${Name}UseCase.ts`),

    // infrastructure
    controller:   path.join(base, 'infrastructure', 'adapters', 'inbound',  'http',        `${Name}Controller.ts`),
    repository:   path.join(base, 'infrastructure', 'adapters', 'outbound', 'persistence', `${Name}Repository.ts`),

    // wiring
    wiring: type === 'modular-monolith'
      ? path.join(base, `${kebab(scopeName)}.module.ts`)
      : path.join(root, 'src', `${kebab(featureName)}.wiring.ts`),

    // shared
    middleware:   path.join(root, 'src', 'shared', 'middlewares', `${Name}Middleware.ts`),

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
    return path.join(root, 'src', 'modules', kebab(scopeName), `${kebab(scopeName)}.module.ts`);
  }
  return path.join(root, 'src', 'wiring.ts');
}

module.exports = { resolvePaths, resolveWiringPath };
