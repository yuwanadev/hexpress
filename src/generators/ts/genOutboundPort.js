'use strict';

const { pascal } = require('../../utils/names');

function genOutboundPort(name) {
  const Name   = pascal(name);
  const Entity = Name;
  return `import type { ${Entity} } from '../../domain/entities/${Entity}.js';

/**
 * ${Name}DatabasePort — Outbound Port (Interface)
 *
 * Defines what this feature needs from the persistence layer.
 * Repository adapters MUST implement this contract.
 */
export interface I${Name}DatabasePort {
  findById(id: string): Promise<${Entity} | null>;
  findAll(): Promise<${Entity}[]>;
  save(entity: ${Entity}): Promise<void>;
  delete(id: string): Promise<void>;
}
`;
}

module.exports = { genOutboundPort };
