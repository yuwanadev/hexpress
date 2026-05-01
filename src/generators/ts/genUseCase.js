'use strict';

const { pascal, camel } = require('../../utils/names');

function genUseCase(type, name, { databasePort = false } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const varDb = `${camel(name)}Db`;
  return `import type { I${Name}Port } from '../ports/inbound/${Name}Port';
import type { ${Name}ResponseDTO } from '../ports/dtos/${Name}DTO';
import { to${Name}ResponseDTO } from '../ports/dtos/${Name}DTO';
import type { I${Name}${Suffix} } from '../ports/outbound/${Name}${Suffix}';
import { ${Name} } from '../../domain/entities/${Name}';
import { AppError } from '${type === 'modular-monolith' ? '../../../../' : '../../'}shared/infrastructure/http/AppError';

/**
 * ${Name}UseCase — Application Use Case
 *
 * Implements I${Name}Port (inbound).
 * Depends on I${Name}${Suffix} (outbound) — injected via constructor shorthand.
 */
export class ${Name}UseCase implements I${Name}Port {
  constructor(private readonly db: I${Name}${Suffix}) {}

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
      throw new AppError('${Name} not found: ' + id, 404);
    }
    return entity;
  }
}
`;
}

module.exports = { genUseCase };
