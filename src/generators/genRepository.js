'use strict';

const { pascal } = require('../utils/names');

function genRepository(name) {
  const Name = pascal(name);
  return `import { ${Name}DatabasePort } from '../../../../application/ports/outbound/${Name}DatabasePort.js';
import { ${Name} }             from '../../../../domain/entities/${Name}.js';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements ${Name}DatabasePort.
 * Uses ${Name}.toDomain() and entity.toPersistence() for mapping.
 * Swap the ORM/driver here without touching any other layer.
 */
export class ${Name}Repository extends ${Name}DatabasePort {
  /**
   * @param {{ model: any }} deps  — Inject your ORM model / db client
   */
  constructor({ model }) {
    super();
    this.model = model;
  }

  async findById(id) {
    const record = await this.model.findOne({ where: { id } });
    if (!record) return null;
    return ${Name}.toDomain(record);
  }

  async findAll() {
    const records = await this.model.findAll();
    return records.map(${Name}.toDomain.bind(${Name}));
  }

  async save(entity) {
    const data = entity.toPersistence();
    await this.model.upsert(data);
  }

  async delete(id) {
    await this.model.destroy({ where: { id } });
  }
}
`;
}

module.exports = { genRepository };
