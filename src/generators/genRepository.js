'use strict';

const { pascal } = require('../utils/names');

function genRepository(type, name, { databasePort = false } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const table = `${name.toLowerCase()}s`;
  return `import { ${Name}${Suffix} } from '../../../../application/ports/outbound/${Name}${Suffix}.js';
import { ${Name} } from '../../../../domain/entities/${Name}.js';
import { AppError } from '${type === 'modular-monolith' ? '../../../../../../' : '../../../../'}shared/infrastructure/http/AppError.js';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements ${Name}${Suffix}.
 * Uses pg Pool for raw SQL queries.
 * Uses ${Name}.toDomain() and entity.toPersistence() for mapping.
 * Swap the driver here without touching any other layer.
 */
export class ${Name}Repository extends ${Name}${Suffix} {
  /**
   * @param {import('pg').Pool} pool
   */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findById(id) {
    try {
      const { rows } = await this.pool.query(
        'SELECT * FROM ${table} WHERE id = $1 LIMIT 1',
        [id],
      );
      if (!rows[0]) return null;
      return ${Name}.toDomain(rows[0]);
    } catch (err) {
      throw new AppError(err.message, 500);
    }
  }

  async findAll() {
    try {
      const { rows } = await this.pool.query('SELECT * FROM ${table}');
      return rows.map((r) => ${Name}.toDomain(r));
    } catch (err) {
      throw new AppError(err.message, 500);
    }
  }

  async save(entity) {
    // TODO: implement save/upsert with raw SQL
    console.warn('[Repository] save() not implemented');
  }

  async delete(id) {
    // TODO: implement delete with raw SQL
    console.warn('[Repository] delete() not implemented');
  }
}
`;
}

module.exports = { genRepository };
