'use strict';

const { pascal, camel, kebab } = require('../../utils/names');

function genController(type, name, { minimal = false, mockPort = true } = {}) {
  const Name = pascal(name);
  const route = kebab(name);
  const varUseCase = `${camel(name)}UseCase`;

  if (minimal && mockPort) {
    const sharedPath = type === 'modular-monolith' ? '../../../../../../shared' : '../../../../shared';
    return `import type { Router } from 'express';
import { IMockPort } from '${sharedPath}/application/MockPort';

/**
 * ${Name}Controller — Inbound HTTP Adapter
 */
export class ${Name}Controller {
  readonly prefix = "/${route}s";
  constructor(private readonly useCase: IMockPort) {}

  registerRoutes(router: Router): void {
    // router.use(this.prefix, router);
    // TODO: register routes
  }
}
`;
  }

  if (minimal && !mockPort) {
    return `import type { Router } from 'express';
import type { I${Name}Port } from '../../../../application/ports/inbound/${Name}Port';

/**
 * ${Name}Controller — Inbound HTTP Adapter
 */
export class ${Name}Controller {
  readonly prefix = "/${route}s";
  constructor(private readonly useCase: I${Name}Port) {}

  registerRoutes(router: Router): void {
    // router.use(this.prefix, router);
    // TODO: register routes
  }
}
`;
  }

  return `import type { Request, Response, NextFunction, Router } from 'express';
import { telemetry } from '${type === 'modular-monolith' ? '../../../../' : '../../'}config/telemetry';
import type { I${Name}Port } from '../../../../application/ports/inbound/${Name}Port';

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
  readonly prefix = "/${route}s";
  constructor(private readonly useCase: I${Name}Port) {}

  // ── Route Registration ────────────────────────────────────────────────────

  registerRoutes(router: Router): void {
    router.use(this.prefix, router);
    router.get('/', this.findAll.bind(this));
    router.get('/:id', this.findById.bind(this));
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  private async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  private async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
