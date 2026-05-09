'use strict';

const { pascal, camel } = require('../utils/names');

function genUseCase(type, name, { databasePort = false, minimal = false, mockPort = true } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const varDb = `${camel(name)}Db`;

  if (minimal && mockPort) {
    const sharedPath = type === 'modular-monolith' ? '../../../../shared' : '../../shared';
    return `import { MockPort } from '${sharedPath}/application/MockPort.js';

/**
 * ${Name}UseCase — Application Use Case
 */
export class ${Name}UseCase extends MockPort {
  constructor() {
    super();
    // TODO: inject dependencies
  }
}
`;
  }

  if (minimal && !mockPort) {
    return `import { ${Name}Port } from '../ports/inbound/${Name}Port.js';

/**
 * ${Name}UseCase — Application Use Case
 *
 * Implements ${Name}Port (inbound).
 */
export class ${Name}UseCase extends ${Name}Port {
  constructor() {
    super();
    // TODO: inject dependencies
  }
}
`;
  }

  return `import { telemetry } from '${type === 'modular-monolith' ? '../../../../' : '../../'}config/telemetry.js';
import { ${Name}Port }         from '../ports/inbound/${Name}Port.js';
import { ${Name}ResponseDTO }  from '../ports/dtos/${Name}DTO.js';
import { ${Name} }             from '../../domain/entities/${Name}.js';
import { AppError }          from '${type === 'modular-monolith' ? '../../../../' : '../../'}shared/infrastructure/http/AppError.js';

/**
 * ${Name}UseCase — Application Use Case
 *
 * Implements ${Name}Port (inbound).
 * Depends on ${Name}${Suffix} (outbound) — injected via constructor.
 * Each method opens an OTel span and ends it in the finally block.
 */
export class ${Name}UseCase extends ${Name}Port {
  /**
   * @param {import('../ports/outbound/${Name}${Suffix}.js').${Name}${Suffix}} ${varDb}
   */
  constructor(${varDb}) {
    super();
    this.db = ${varDb};
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findById(span, id) {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}UseCase.findById');
    try {
      const entity = await this.#findOrFail(childSpan, id);
      return ${Name}ResponseDTO.fromEntity(entity);
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw err;
    } finally {
      childSpan.end();
    }
  }

  async findAll(span) {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}UseCase.findAll');
    try {
      const entities = await this.db.findAll(childSpan);
      return entities.map(${Name}ResponseDTO.fromEntity.bind(${Name}ResponseDTO));
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw err;
    } finally {
      childSpan.end();
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  async #findOrFail(span, id) {
    const entity = await this.db.findById(span, id);
    if (!entity) throw new AppError('${Name} not found: ' + id, 404);
    return entity;
  }
}
`;
}


module.exports = { genUseCase };
