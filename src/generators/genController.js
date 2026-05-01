'use strict';

const { pascal, camel, kebab } = require('../utils/names');

function genController(name) {
  const Name = pascal(name);
  const route = kebab(name);
  return `import { ${Name}Port } from '../../../../application/ports/inbound/${Name}Port.js';

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
  /**
   * @param {${Name}Port} ${camel(name)}UseCase
   */
  constructor(${camel(name)}UseCase) {
    this.useCase = ${camel(name)}UseCase;
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
    router.post('/',       this.#create.bind(this));
    router.get('/',        this.#findAll.bind(this));
    router.get('/:id',     this.#findById.bind(this));
    router.put('/:id',     this.#update.bind(this));
    router.delete('/:id',  this.#delete.bind(this));
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async #create(req, res, next) {
    try {
      const result = await this.useCase.create(req.body);
      res.ApiResponse(result, 201);
    } catch (err) { next(err); }
  }

  async #findAll(req, res, next) {
    try {
      const result = await this.useCase.findAll();
      res.ApiResponse(result);
    } catch (err) { next(err); }
  }

  async #findById(req, res, next) {
    try {
      const result = await this.useCase.findById(req.params.id);
      res.ApiResponse(result);
    } catch (err) { next(err); }
  }

  async #update(req, res, next) {
    try {
      const result = await this.useCase.update(req.params.id, req.body);
      res.ApiResponse(result);
    } catch (err) { next(err); }
  }

  async #delete(req, res, next) {
    try {
      await this.useCase.delete(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
`;
}

module.exports = { genController };
