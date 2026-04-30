'use strict';

function genSharedAggregateRoot() {
  return `import { Entity } from './Entity.js';

/**
 * AggregateRoot — Entity with domain event tracking.
 */
export class AggregateRoot extends Entity {
  #domainEvents = [];

  addDomainEvent(event)  { this.#domainEvents.push(event); }

  pullDomainEvents() {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }
}
`;
}

module.exports = { genSharedAggregateRoot };
