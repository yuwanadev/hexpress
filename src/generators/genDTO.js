'use strict';

const { pascal } = require('../utils/names');

function genDTO(name) {
  const Name = pascal(name);
  return `/**
 * ${Name}RequestDTO — Inbound request shape.
 * Plain object. No methods, no business logic.
 *
 * @typedef {Object} ${Name}RequestDTO
 * @property {string} id
 */
export class ${Name}RequestDTO {
  /**
   * @param {Object} data
   */
  constructor(data) {
    // TODO: map fields from raw request body
    // this.field = data.field;
    Object.assign(this, data);
  }
}

/**
 * ${Name}ResponseDTO — Outbound response shape.
 *
 * @typedef {Object} ${Name}ResponseDTO
 * @property {string} id
 * @property {string} createdAt
 * @property {string} updatedAt
 */
export class ${Name}ResponseDTO {
  constructor(data) {
    this.id        = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    // TODO: map additional fields
  }

  /**
   * Build from a domain entity (calls entity.toJSON()).
   * @param {Object} entity
   * @returns {${Name}ResponseDTO}
   */
  static fromEntity(entity) {
    return new ${Name}ResponseDTO(entity.toJSON());
  }
}
`;
}

module.exports = { genDTO };
