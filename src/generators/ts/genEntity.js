'use strict';

const { pascal } = require('../../utils/names');

function genEntity(name) {
  const Name = pascal(name);
  return `/**
 * ${Name} — Domain Entity
 *
 * Pure domain object. Zero framework dependencies.
 * Mapper logic lives here as static methods (toDomain / toJSON).
 */

export interface ${Name}Props {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ${Name}Persistence {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class ${Name} {
  public readonly id?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor({ id, createdAt, updatedAt }: ${Name}Props) {
    this.id        = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // ── Mapper ────────────────────────────────────────────────────────────────

  /**
   * Reconstitute from a raw DB / persistence record.
   */
  static toDomain(record: ${Name}Persistence): ${Name} {
    return new ${Name}({
      id:        record.id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  /**
   * Serialize to persistence record.
   */
  toPersistence(): ${Name}Persistence {
    return {
      id:         this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Serialize to response DTO (JSON-safe plain object).
   */
  toJSON(): ${Name}Props {
    return {
      id:        this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
`;
}

module.exports = { genEntity };
