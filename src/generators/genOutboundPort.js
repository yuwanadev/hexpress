'use strict';

const { pascal } = require('../utils/names');

function genOutboundPort(name, { databasePort = false } = {}) {
  const Name   = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const Entity = Name; // entity name mirrors feature name
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
   * @returns {Promise<import('../../entities/${Entity}.js').${Entity}|null>}
   */
  async findById(id) {
    throw new Error('${Name}${Suffix}.findById() not implemented');
  }

  /**
   * @returns {Promise<import('../../entities/${Entity}.js').${Entity}[]>}
   */
  async findAll() {
    throw new Error('${Name}${Suffix}.findAll() not implemented');
  }

  /**
   * @param {import('../../entities/${Entity}.js').${Entity}} entity
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
