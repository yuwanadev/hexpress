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
   * @param {any} span
   * @param {string} id
   * @returns {Promise<${resDTO}>}
   */
  async findById(span, id) {
    throw new Error('${Name}Port.findById() not implemented');
  }

  /**
   * @param {any} span
   * @returns {Promise<${resDTO}[]>}
   */
  async findAll(span) {
    throw new Error('${Name}Port.findAll() not implemented');
  }
}
`;
}

module.exports = { genInboundPort };
