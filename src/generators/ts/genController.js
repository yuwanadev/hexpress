'use strict';

const { pascal, camel, kebab } = require('../../utils/names');

function genController(name) {
  const Name  = pascal(name);
  const route = kebab(name);
  return `import type { Request, Response, NextFunction, Router } from 'express';
import type { I${Name}Port } from '../../../../application/ports/inbound/${Name}Port.js';

/**
 * ${Name}Controller — Inbound HTTP Adapter
 *
 * Combines route registration and handler methods.
 * Implements no business logic — delegates entirely to the use-case (port).
 *
 * Usage (in wiring):
 *   const ctrl = new ${Name}Controller({ ${camel(name)}UseCase });
 *   ctrl.registerRoutes(router);
 */
export class ${Name}Controller {
  private readonly useCase: I${Name}Port;

  constructor({ ${camel(name)}UseCase }: { ${camel(name)}UseCase: I${Name}Port }) {
    this.useCase = ${camel(name)}UseCase;
  }

  // ── Route Registration ────────────────────────────────────────────────────

  registerRoutes(router: Router): void {
    router.post('/${route}s',       this.create.bind(this));
    router.get('/${route}s',        this.findAll.bind(this));
    router.get('/${route}s/:id',    this.findById.bind(this));
    router.put('/${route}s/:id',    this.update.bind(this));
    router.delete('/${route}s/:id', this.remove.bind(this));
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  private async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.useCase.create(req.body);
      res.status(201).json({ data: result });
    } catch (err) { next(err); }
  }

  private async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.useCase.findAll();
      res.status(200).json({ data: result });
    } catch (err) { next(err); }
  }

  private async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.useCase.findById(req.params.id);
      res.status(200).json({ data: result });
    } catch (err) { next(err); }
  }

  private async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.useCase.update(req.params.id, req.body);
      res.status(200).json({ data: result });
    } catch (err) { next(err); }
  }

  private async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.useCase.delete(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
`;
}

module.exports = { genController };
