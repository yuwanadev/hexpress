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

  return `import type { Pool } from 'pg';
import type { I${Name}${Suffix} } from '../../../../application/ports/outbound/${Name}${Suffix}';
import { ${Name} } from '../../../../domain/entities/${Name}';
import { AppError } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}shared/infrastructure/http/AppError';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements I${Name}${Suffix}.
 * Uses pg Pool for raw SQL queries.
 * Uses ${Name}.toDomain() and entity.toPersistence() for mapping.
 * Swap the driver here without touching any other layer.
 */
export class ${Name}Repository implements I${Name}${Suffix} {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<${Name} | null> {
    try {
      const { rows } = await this.pool.query(
        'SELECT * FROM ${table} WHERE id = $1 LIMIT 1',
        [id],
      );
      if (!rows[0]) return null;
      return ${Name}.toDomain(rows[0]);
    } catch (err) {
      throw new AppError((err as Error).message, 500);
    }
  }

  async findAll(): Promise<${Name}[]> {
    try {
      const { rows } = await this.pool.query('SELECT * FROM ${table}');
      return rows.map((r) => ${Name}.toDomain(r));
    } catch (err) {
      throw new AppError((err as Error).message, 500);
    }
  }
}
`;
}

module.exports = { genRepository };
