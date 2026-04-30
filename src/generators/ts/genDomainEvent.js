'use strict';

const { pascal } = require('../../utils/names');

function genDomainEvent(name, entityName) {
  const Name       = pascal(name);
  const EntityName = pascal(entityName ?? name.replace(/Event$/, ''));
  return `/**
 * ${Name} — Domain Event
 * Immutable. Represents something that happened in the domain.
 */

export interface ${Name}Payload {
  // TODO: define event-specific payload fields
  [key: string]: unknown;
}

export class ${Name} {
  public readonly eventName: string = '${Name}';
  public readonly aggregateId: string;
  public readonly payload: ${Name}Payload;
  public readonly occurredAt: Date;

  constructor({ aggregateId, payload = {} }: { aggregateId: string; payload?: ${Name}Payload }) {
    this.aggregateId = aggregateId;
    this.payload     = payload;
    this.occurredAt  = new Date();
    Object.freeze(this);
  }
}
`;
}

module.exports = { genDomainEvent };
