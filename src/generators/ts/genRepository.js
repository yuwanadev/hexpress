'use strict';

const { pascal } = require('../../utils/names');

function genRepository(type, name) {
  const Name = pascal(name);
  const table = `${name.toLowerCase()}s`;
  return `import type { Pool } from 'pg';
import type { I${Name}DatabasePort } from '../../../../application/ports/outbound/${Name}DatabasePort';
import { ${Name} } from '../../../../domain/entities/${Name}';
import { AppError } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}shared/infrastructure/http/AppError';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements I${Name}DatabasePort.
 * Uses pg Pool for raw SQL queries.
 * Uses ${Name}.toDomain() and entity.toPersistence() for mapping.
 * Swap the driver here without touching any other layer.
 */
export class ${Name}Repository implements I${Name}DatabasePort {
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
