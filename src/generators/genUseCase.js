'use strict';

const { pascal, camel } = require('../utils/names');

function genUseCase(type, name, { databasePort = false } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const varDb = `${camel(name)}Db`;
  return `import { ${Name}Port }         from '../ports/inbound/${Name}Port.js';
import { ${Name}ResponseDTO }  from '../ports/dtos/${Name}DTO.js';
import { ${Name} }             from '../../domain/entities/${Name}.js';

/**
 * ${Name}UseCase — Application Use Case
 *
 * Implements ${Name}Port (inbound).
 * Depends on ${Name}${Suffix} (outbound) — injected via constructor.
 */
export class ${Name}UseCase extends ${Name}Port {
  /**
   * @param {import('../ports/outbound/${Name}${Suffix}.js').${Name}${Suffix}} ${varDb}
   */
  constructor(${varDb}) {
    super();
    this.db = ${varDb};
  }

  // ── Commands ──────────────────────────────────────────────────────────────

  async create(request) {
    const entity = new ${Name}({
      id:        crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // TODO: map request fields onto entity
    });

    await this.db.save(entity);
    return ${Name}ResponseDTO.fromEntity(entity);
  }

  async update(id, request) {
    const entity = await this.#findOrFail(id);
    entity.updatedAt = new Date();
    // TODO: apply changes from request

    await this.db.save(entity);
    return ${Name}ResponseDTO.fromEntity(entity);
  }

  async delete(id) {
    await this.#findOrFail(id);
    await this.db.delete(id);
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findById(id) {
    const entity = await this.#findOrFail(id);
    return ${Name}ResponseDTO.fromEntity(entity);
  }

  async findAll() {
    const entities = await this.db.findAll();
    return entities.map(${Name}ResponseDTO.fromEntity.bind(${Name}ResponseDTO));
  }

  // ── Private ───────────────────────────────────────────────────────────────

  async #findOrFail(id) {
    const entity = await this.db.findById(id);
    if (!entity) throw Object.assign(new Error('${Name} not found: ' + id), { statusCode: 404 });
    return entity;
  }
}
`;
}


module.exports = { genUseCase };
