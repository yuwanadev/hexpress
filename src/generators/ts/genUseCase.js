'use strict';

const { pascal, camel } = require('../../utils/names');

function genUseCase(type, name, { databasePort = false, minimal = false, mockPort = true } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const varDb = `${camel(name)}Db`;

  if (minimal && mockPort) {
    const sharedPath = type === 'modular-monolith' ? '../../../../shared' : '../../shared';
    return `import { IMockPort } from '${sharedPath}/application/MockPort';

/**
 * ${Name}UseCase — Application Use Case
 */
export class ${Name}UseCase implements IMockPort {
  constructor() {
    // TODO: inject dependencies
  }
}
`;
  }

  if (minimal && !mockPort) {
    return `import type { I${Name}Port } from '../ports/inbound/${Name}Port';

/**
 * ${Name}UseCase — Application Use Case
 *
 * Implements I${Name}Port (inbound).
 */
export class ${Name}UseCase implements I${Name}Port {
  constructor() {
    // TODO: inject dependencies
  }
}
`;
  }

  return `import type { Span } from '@opentelemetry/api';
import { telemetry } from '${type === 'modular-monolith' ? '../../../../' : '../../'}config/telemetry';
import type { I${Name}Port } from '../ports/inbound/${Name}Port';
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
 * Each method opens an OTel span and ends it in the finally block.
 */
export class ${Name}UseCase implements I${Name}Port {
  constructor(private readonly db: I${Name}${Suffix}) {}

  async findById(span: Span, id: string): Promise<${Name}ResponseDTO> {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}UseCase.findById');
    try {
      const entity = await this.findOrFail(childSpan, id);
      return to${Name}ResponseDTO(entity);
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw err;
    } finally {
      childSpan.end();
    }
  }

  async findAll(span: Span): Promise<${Name}ResponseDTO[]> {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}UseCase.findAll');
    try {
      const entities = await this.db.findAll(childSpan);
      return entities.map(to${Name}ResponseDTO);
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw err;
    } finally {
      childSpan.end();
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async findOrFail(span: Span, id: string): Promise<${Name}> {
    const entity = await this.db.findById(span, id);
    if (!entity) {
      throw new AppError('${Name} not found: ' + id, 404);
    }
    return entity;
  }
}
`;
}

module.exports = { genUseCase };
