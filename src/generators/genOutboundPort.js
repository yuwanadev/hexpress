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
   * @param {any} span
   * @param {string} id
   * @returns {Promise<import('../../../domain/entities/${Entity}.js').${Entity}|null>}
   */
  async findById(span, id) {
    throw new Error('${Name}${Suffix}.findById() not implemented');
  }

  /**
   * @param {any} span
   * @returns {Promise<import('../../../domain/entities/${Entity}.js').${Entity}[]>}
   */
  async findAll(span) {
    throw new Error('${Name}${Suffix}.findAll() not implemented');
  }
}
`;
}

module.exports = { genOutboundPort };
