'use strict';

const { pascal } = require('../../utils/names');

function genRepository(name) {
  const Name = pascal(name);
  return `import type { I${Name}DatabasePort } from '../../../../application/ports/outbound/${Name}DatabasePort.js';
import { ${Name} }                    from '../../../../domain/entities/${Name}.js';

/**
 * ${Name}Repository — Outbound Persistence Adapter
 *
 * Implements I${Name}DatabasePort.
 * Uses ${Name}.toDomain() and entity.toPersistence() for mapping.
 * Swap the ORM/driver here without touching any other layer.
 */
export class ${Name}Repository implements I${Name}DatabasePort {
  private readonly model: any;

  constructor({ model }: { model: any }) {
    this.model = model;
  }

  async findById(id: string): Promise<${Name} | null> {
    const record = await this.model.findOne({ where: { id } });
    if (!record) return null;
    return ${Name}.toDomain(record);
  }

  async findAll(): Promise<${Name}[]> {
    const records = await this.model.findAll();
    return records.map((r: any) => ${Name}.toDomain(r));
  }

  async save(entity: ${Name}): Promise<void> {
    const data = entity.toPersistence();
    await this.model.upsert(data);
  }

  async delete(id: string): Promise<void> {
    await this.model.destroy({ where: { id } });
  }
}
`;
}

module.exports = { genRepository };
