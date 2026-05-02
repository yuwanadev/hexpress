'use strict';

const { pascal } = require('../utils/names');

function genInboundPort(type, name, { minimal = false } = {}) {
  const Name = pascal(name);
  const nameDTO = `${Name}RequestDTO`;
  const resDTO = `${Name}ResponseDTO`;

  if (minimal) {
    return `/**
 * ${Name}Port — Inbound Port
 *
 * Defines what this feature exposes to the outside world.
 * Use-cases MUST implement this contract.
 *
 * @interface
 */
export class ${Name}Port {
  // TODO: define inbound contract
}
`;
  }

  return `import { ${nameDTO}, ${resDTO} } from '../dtos/${Name}DTO.js';

/**
 * ${Name}Port — Inbound Port
 *
 * Defines what this feature exposes to the outside world.
 * Use-cases MUST implement this contract.
 *
 * @interface
 */
export class ${Name}Port {
  /**
   * @param {${nameDTO}} request
   * @returns {Promise<${resDTO}>}
   */
  async create(request) {
    throw new Error('${Name}Port.create() not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<${resDTO}>}
   */
  async findById(id) {
    throw new Error('${Name}Port.findById() not implemented');
  }

  /**
   * @returns {Promise<${resDTO}[]>}
   */
  async findAll() {
    throw new Error('${Name}Port.findAll() not implemented');
  }

  /**
   * @param {string} id
   * @param {Partial<${nameDTO}>} request
   * @returns {Promise<${resDTO}>}
   */
  async update(id, request) {
    throw new Error('${Name}Port.update() not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('${Name}Port.delete() not implemented');
  }
}
`;
}

module.exports = { genInboundPort };
