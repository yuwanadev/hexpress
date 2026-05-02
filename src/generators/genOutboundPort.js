'use strict';

const { pascal } = require('../utils/names');

function genOutboundPort(type, name, { databasePort = false, minimal = false } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const Entity = Name; // entity name mirrors feature name

  if (minimal) {
    return `/**
 * ${Name}${Suffix} — Outbound Port
 *
 * Defines what this feature needs from the persistence layer.
 * Repository adapters MUST implement this contract.
 *
 * @interface
 */
export class ${Name}${Suffix} {
  // TODO: define outbound contract
}
`;
  }

  return `/**
 * ${Name}${Suffix} — Outbound Port
 *
 * Defines what this feature needs from the persistence layer.
 * Repository adapters MUST implement this contract.
 *
 * @interface
 */
export class ${Name}${Suffix} {
  /**
   * @param {string} id
   * @returns {Promise<import('../../../domain/entities/${Entity}.js').${Entity}|null>}
   */
  async findById(id) {
    throw new Error('${Name}${Suffix}.findById() not implemented');
  }

  /**
   * @returns {Promise<import('../../../domain/entities/${Entity}.js').${Entity}[]>}
   */
  async findAll() {
    throw new Error('${Name}${Suffix}.findAll() not implemented');
  }

  /**
   * @param {import('../../../domain/entities/${Entity}.js').${Entity}} entity
   * @returns {Promise<void>}
   */
  async save(entity) {
    throw new Error('${Name}${Suffix}.save() not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('${Name}${Suffix}.delete() not implemented');
  }
}
`;
}

module.exports = { genOutboundPort };
