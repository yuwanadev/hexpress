'use strict';

const { pascal } = require('../utils/names');

function genOutboundPort(name) {
  const Name   = pascal(name);
  const Entity = Name; // entity name mirrors feature name
  return `/**
 * ${Name}DatabasePort — Outbound Port
 *
 * Defines what this feature needs from the persistence layer.
 * Repository adapters MUST implement this contract.
 *
 * @interface
 */
export class ${Name}DatabasePort {
  /**
   * @param {string} id
   * @returns {Promise<import('../../entities/${Entity}.js').${Entity}|null>}
   */
  async findById(id) {
    throw new Error('${Name}DatabasePort.findById() not implemented');
  }

  /**
   * @returns {Promise<import('../../entities/${Entity}.js').${Entity}[]>}
   */
  async findAll() {
    throw new Error('${Name}DatabasePort.findAll() not implemented');
  }

  /**
   * @param {import('../../entities/${Entity}.js').${Entity}} entity
   * @returns {Promise<void>}
   */
  async save(entity) {
    throw new Error('${Name}DatabasePort.save() not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('${Name}DatabasePort.delete() not implemented');
  }
}
`;
}

module.exports = { genOutboundPort };
