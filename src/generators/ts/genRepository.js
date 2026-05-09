'use strict';

const { pascal } = require('../../utils/names');

function genRepository(type, name, { databasePort = false, minimal = false, mockPort = true } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const table = `${name.toLowerCase()}s`;

  if (minimal && mockPort) {
    const sharedPath = type === 'modular-monolith' ? '../../../../../../shared' : '../../../../shared';
    return `import type { Pool } from 'pg';
import { IMockPort } from '${sharedPath}/application/MockPort';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 */
export class ${Name}Repository implements IMockPort {
  constructor(private readonly pool: Pool) {}
}
`;
  }

  if (minimal && !mockPort) {
    return `import type { Pool } from 'pg';
import type { I${Name}${Suffix} } from '../../../../application/ports/outbound/${Name}${Suffix}';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements I${Name}${Suffix}.
 */
export class ${Name}Repository implements I${Name}${Suffix} {
  constructor(private readonly pool: Pool) {}
}
`;
  }

  return `import type { Span } from '@opentelemetry/api';
import { telemetry } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}config/telemetry';
import type { Pool } from 'pg';
import type { I${Name}${Suffix} } from '../../../../application/ports/outbound/${Name}${Suffix}';
import { ${Name} } from '../../../../domain/entities/${Name}';
import { AppError } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}shared/infrastructure/http/AppError';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements I${Name}${Suffix}.
 * Uses pg Pool for raw SQL queries.
 * Each method opens an OTel span and ends it in the finally block.
 */
export class ${Name}Repository implements I${Name}${Suffix} {
  constructor(private readonly pool: Pool) {}

  async findById(span: Span, id: string): Promise<${Name} | null> {
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
      throw new AppError((err as Error).message, 500);
    } finally {
      childSpan.end();
    }
  }

  async findAll(span: Span): Promise<${Name}[]> {
    const { span: childSpan } = telemetry.startChildSpan(span, '${Name}Repository.findAll');
    try {
      const { rows } = await this.pool.query('SELECT * FROM ${table}');
      return rows.map((r) => ${Name}.toDomain(r));
    } catch (err) {
      telemetry.setLogError(childSpan, err);
      throw new AppError((err as Error).message, 500);
    } finally {
      childSpan.end();
    }
  }
}
`;
}

module.exports = { genRepository };
