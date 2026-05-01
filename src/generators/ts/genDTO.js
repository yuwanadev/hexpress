'use strict';

const { pascal } = require('../../utils/names');

function genDTO(name) {
  const Name = pascal(name);
  return `/**
 * ${Name}RequestDTO — Inbound request shape.
 * Plain object. No methods, no business logic.
 */
export interface ${Name}RequestDTO {
  // TODO: define request fields
  [key: string]: unknown;
}

/**
 * ${Name}ResponseDTO — Outbound response shape.
 */
export interface ${Name}ResponseDTO {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // TODO: add additional response fields
}

/**
 * Build a ${Name}ResponseDTO from a domain entity.
 */
export function to${Name}ResponseDTO(entity: { toJSON(): ${Name}ResponseDTO }): ${Name}ResponseDTO {
  return entity.toJSON();
}

/**
 * Build a ${Name}RequestDTO from a request.
 */
export function to${Name}RequestDTO(request: any): ${Name}RequestDTO {
  // TODO: map request fields to RegisterRequestDTO
  return request as ${Name}RequestDTO;
}
`;
}

module.exports = { genDTO };
