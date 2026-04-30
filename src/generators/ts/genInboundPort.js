'use strict';

const { pascal } = require('../../utils/names');

function genInboundPort(name) {
  const Name    = pascal(name);
  const nameDTO = `${Name}RequestDTO`;
  const resDTO  = `${Name}ResponseDTO`;
  return `import type { ${nameDTO}, ${resDTO} } from '../dtos/${Name}DTO.js';

/**
 * ${Name}Port — Inbound Port (Interface)
 *
 * Defines what this feature exposes to the outside world.
 * Use-cases MUST implement this contract.
 */
export interface I${Name}Port {
  create(request: ${nameDTO}): Promise<${resDTO}>;
  findById(id: string): Promise<${resDTO}>;
  findAll(): Promise<${resDTO}[]>;
  update(id: string, request: Partial<${nameDTO}>): Promise<${resDTO}>;
  delete(id: string): Promise<void>;
}
`;
}

module.exports = { genInboundPort };
