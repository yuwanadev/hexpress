'use strict';

const { pascal } = require('../../utils/names');

function genInboundPort(type, name, { minimal = false } = {}) {
  const Name = pascal(name);
  const resDTO = `${Name}ResponseDTO`;

  if (minimal) {
    return `/**
 * ${Name}Port — Inbound Port (Interface)
 *
 * Defines what this feature exposes to the outside world.
 * Use-cases MUST implement this contract.
 */
export interface I${Name}Port {
  // TODO: define inbound contract
}
`;
  }

  return `import type { Span } from '@opentelemetry/api';
import type { ${resDTO} } from '../dtos/${Name}DTO';

/**
 * ${Name}Port — Inbound Port (Interface)
 *
 * Defines what this feature exposes to the outside world.
 * Use-cases MUST implement this contract.
 */
export interface I${Name}Port {
  findById(span: Span, id: string): Promise<${resDTO}>;
  findAll(span: Span): Promise<${resDTO}[]>;
}
`;
}

module.exports = { genInboundPort };
