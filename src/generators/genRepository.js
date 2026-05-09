'use strict';

const { pascal } = require('../utils/names');

function genRepository(type, name, { databasePort = false, minimal = false, mockPort = true } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const table = `${name.toLowerCase()}s`;

  if (minimal && mockPort) {
    const sharedPath = type === 'modular-monolith' ? '../../../../../../shared' : '../../../../shared';
    return `import { MockPort } from '${sharedPath}/application/MockPort.js';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 */
export class ${Name}Repository extends MockPort {
  /**
   * @param {import('pg').Pool} pool
   */
  constructor(pool) {
    super();
    this.pool = pool;
  }
}
`;
  }

  if (minimal && !mockPort) {
    return `import { ${Name}${Suffix} } from '../../../../application/ports/outbound/${Name}${Suffix}.js';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements ${Name}${Suffix}.
 */
export class ${Name}Repository extends ${Name}${Suffix} {
  /**
   * @param {import('pg').Pool} pool
   */
  constructor(pool) {
    super();
    this.pool = pool;
  }
}
`;
  }

  return `import { telemetry } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}config/telemetry.js';
import { ${Name}${Suffix} } from '../../../../application/ports/outbound/${Name}${Suffix}.js';
import { ${Name} } from '../../../../domain/entities/${Name}.js';
import { AppError } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}shared/infrastructure/http/AppError.js';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements ${Name}${Suffix}.
 * Uses pg Pool for raw SQL queries.
 * Each method opens an OTel span and ends it in the finally block.
 */
export class ${Name}Repository extends ${Name}${Suffix} {
  /**
   * @param {import('pg').Pool} pool
   */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findById(span, id) {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}Repository.findById');
    try {
      const { rows } = await this.pool.query(
        'SELECT * FROM ${table} WHERE id = $1 LIMIT 1',
        [id],
      );
      if (!rows[0]) return null;
      return ${Name}.toDomain(rows[0]);
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw new AppError(err.message, 500);
    } finally {
      childSpan.end();
    }
  }

  async findAll(span) {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}Repository.findAll');
    try {
      const { rows } = await this.pool.query('SELECT * FROM ${table}');
      return rows.map((r) => ${Name}.toDomain(r));
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw new AppError(err.message, 500);
    } finally {
      childSpan.end();
    }
  }
}
`;
}

module.exports = { genRepository };
