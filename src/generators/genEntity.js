'use strict';

const { pascal } = require('../utils/names');

function genEntity(name) {
  const Name = pascal(name);
  return `/**
 * ${Name} — Domain Entity
 *
 * Pure domain object. Zero framework dependencies.
 * Mapper logic lives here as static methods (toDomain / toJSON).
 */
export class ${Name} {
  constructor({ id, createdAt, updatedAt } = {}) {
    this.id        = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // ── Mapper ────────────────────────────────────────────────────────────────

  /**
   * Reconstitute from a raw DB / persistence record.
   * @param {Object} record
   * @returns {${Name}}
   */
  static toDomain(record) {
    return new ${Name}({
      id:        record.id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  /**
   * Serialize to persistence record.
   * @returns {Object}
   */
  toPersistence() {
    return {
      id:         this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Serialize to response DTO (JSON-safe plain object).
   * @returns {Object}
   */
  toJSON() {
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
