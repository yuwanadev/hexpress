'use strict';

const { pascal, camel, kebab } = require('../utils/names');

function genController(type, name, { minimal = false, mockPort = true } = {}) {
  const Name = pascal(name);
  const route = kebab(name);
  const varUseCase = `${camel(name)}UseCase`;

  if (minimal && mockPort) {
    return `/**
 * ${Name}Controller — Inbound HTTP Adapter
 */
export class ${Name}Controller {
  constructor(${varUseCase}) {
    this.useCase = ${varUseCase};
    this.prefix = "/${route}s";
  }

  registerRoutes(router) {
    // router.use(this.prefix, router);
    // TODO: register routes
  }
}
`;
  }

  if (minimal && !mockPort) {
    return `import { ${Name}Port } from '../../../../application/ports/inbound/${Name}Port.js';

/**
 * ${Name}Controller — Inbound HTTP Adapter
 */
export class ${Name}Controller {
  constructor(${varUseCase}) {
    this.useCase = ${varUseCase};
    this.prefix = "/${route}s";
  }

  registerRoutes(router) {
    // router.use(this.prefix, router);
    // TODO: register routes
  }
}
`;
  }

  return `import { telemetry } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}config/telemetry.js';
import { ${Name}Port } from '../../../../application/ports/inbound/${Name}Port.js';

/**
 * ${Name}Controller — Inbound HTTP Adapter
 *
 * Combines route registration and handler methods.
 * Implements no business logic — delegates entirely to the use-case (port).
 * Each handler opens an OTel span and ends it in the finally block.
 *
 * Usage (in wiring):
 *   const ctrl = new ${Name}Controller(${varUseCase});
 *   ctrl.registerRoutes(router);
 */
export class ${Name}Controller {
  /**
   * @param {${Name}Port} ${varUseCase}
   */
  constructor(${varUseCase}) {
    this.useCase = ${varUseCase};
    this.prefix = "/${route}s";
  }

  // ── Route Registration ────────────────────────────────────────────────────

  /**
   * Register all ${Name} routes onto an Express router (or compatible).
   * Call this from your module wiring file.
   *
   * @param {import('express').Router} router
   */
  registerRoutes(router) {
    router.use(this.prefix, router);
    router.get('/',        this.#findAll.bind(this));
    router.get('/:id',     this.#findById.bind(this));
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async #findAll(req, res, next) {
    const { span } = telemetry.startSpan('${Name}Controller.findAll');
    try {
      const result = await this.useCase.findAll(span);
      res.ApiResponse(result);
    } catch (err) {
      telemetry.setLogError(span, err);
      next(err);
    } finally {
      span.end();
    }
  }

  async #findById(req, res, next) {
    const { span } = telemetry.startSpan('${Name}Controller.findById');
    try {
      const result = await this.useCase.findById(span, req.params.id);
      res.ApiResponse(result);
    } catch (err) {
      telemetry.setLogError(span, err);
      next(err);
    } finally {
      span.end();
    }
  }
}
`;
}

module.exports = { genController };
