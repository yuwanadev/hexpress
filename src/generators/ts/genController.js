'use strict';

const { pascal, camel, kebab } = require('../../utils/names');

function genController(name) {
  const Name = pascal(name);
  const route = kebab(name);
  return `import type { Request, Response, NextFunction, Router } from 'express';
import type { I${Name}Port } from '../../../../application/ports/inbound/${Name}Port';

/**
 * ${Name}Controller — Inbound HTTP Adapter
 *
 * Combines route registration and handler methods.
 * Implements no business logic — delegates entirely to the use-case (port).
 *
 * Usage (in wiring):
 *   const ctrl = new ${Name}Controller(${camel(name)}UseCase);
 *   ctrl.registerRoutes(router);
 */
export class ${Name}Controller {
  readonly prefix = "/${route}s";
  constructor(private readonly useCase: I${Name}Port) {}

  // ── Route Registration ────────────────────────────────────────────────────

  registerRoutes(router: Router): void {
    router.use(this.prefix, router);
    router.post('/', this.findAll.bind(this));
    router.get('/', this.findById.bind(this));
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  private async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.useCase.findAll();
      res.ApiResponse(result);
    } catch (err) { next(err); }
  }

  private async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.useCase.findById(req.params.id);
      res.ApiResponse(result);
    } catch (err) { next(err); }
  }
}
`;
}

module.exports = { genController };
