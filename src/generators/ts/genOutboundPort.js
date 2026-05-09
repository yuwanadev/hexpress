'use strict';

const { pascal } = require('../../utils/names');

function genOutboundPort(type, name, { databasePort = false, minimal = false } = {}) {
  const Name = pascal(name);
  const Suffix = databasePort ? 'DatabasePort' : 'OutboundPort';
  const Entity = Name;

  if (minimal) {
    return `/**
 * ${Name}${Suffix} — Outbound Port (Interface)
 *
 * Defines what this feature needs from the persistence layer.
 * Repository adapters MUST implement this contract.
 */
export interface I${Name}${Suffix} {
  // TODO: define outbound contract
}
`;
  }

  return `import type { Span } from '@opentelemetry/api';
import type { ${Entity} } from '../../../domain/entities/${Entity}';

/**
 * ${Name}${Suffix} — Outbound Port (Interface)
 *
 * Defines what this feature needs from the persistence layer.
 * Repository adapters MUST implement this contract.
 */
export interface I${Name}${Suffix} {
  findById(span: Span, id: string): Promise<${Entity} | null>;
  findAll(span: Span): Promise<${Entity}[]>;
}
`;
}

module.exports = { genOutboundPort };
