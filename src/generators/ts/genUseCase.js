'use strict';

const { pascal, camel } = require('../../utils/names');

function genUseCase(name) {
  const Name   = pascal(name);
  const varDb  = `${camel(name)}Db`;
  return `import type { I${Name}Port }         from '../ports/inbound/${Name}Port.js';
import type { ${Name}RequestDTO, ${Name}ResponseDTO } from '../ports/dtos/${Name}DTO.js';
import { to${Name}ResponseDTO }     from '../ports/dtos/${Name}DTO.js';
import type { I${Name}DatabasePort } from '../ports/outbound/${Name}DatabasePort.js';
import { ${Name} }                   from '../../domain/entities/${Name}.js';
import { randomUUID }                from 'crypto';

/**
 * ${Name}UseCase — Application Use Case
 *
 * Implements I${Name}Port (inbound).
 * Depends on I${Name}DatabasePort (outbound) — injected via constructor.
 */
export class ${Name}UseCase implements I${Name}Port {
  private readonly db: I${Name}DatabasePort;

  constructor({ ${varDb} }: { ${varDb}: I${Name}DatabasePort }) {
    this.db = ${varDb};
  }

  // ── Commands ──────────────────────────────────────────────────────────────

  async create(request: ${Name}RequestDTO): Promise<${Name}ResponseDTO> {
    const entity = new ${Name}({
      id:        randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // TODO: map request fields onto entity
    });

    await this.db.save(entity);
    return to${Name}ResponseDTO(entity);
  }

  async update(id: string, request: Partial<${Name}RequestDTO>): Promise<${Name}ResponseDTO> {
    const entity = await this.findOrFail(id);
    entity.updatedAt = new Date();
    // TODO: apply changes from request

    await this.db.save(entity);
    return to${Name}ResponseDTO(entity);
  }

  async delete(id: string): Promise<void> {
    await this.findOrFail(id);
    await this.db.delete(id);
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findById(id: string): Promise<${Name}ResponseDTO> {
    const entity = await this.findOrFail(id);
    return to${Name}ResponseDTO(entity);
  }

  async findAll(): Promise<${Name}ResponseDTO[]> {
    const entities = await this.db.findAll();
    return entities.map(to${Name}ResponseDTO);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async findOrFail(id: string): Promise<${Name}> {
    const entity = await this.db.findById(id);
    if (!entity) {
      const err = new Error('${Name} not found: ' + id) as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    }
    return entity;
  }
}
`;
}

module.exports = { genUseCase };
