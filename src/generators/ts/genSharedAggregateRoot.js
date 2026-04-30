'use strict';

function genSharedAggregateRoot() {
  return `import { Entity } from './Entity.js';

export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

/**
 * AggregateRoot — Entity with domain event tracking.
 */
export abstract class AggregateRoot extends Entity {
  #domainEvents: DomainEvent[] = [];

  addDomainEvent(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }
}
`;
}

module.exports = { genSharedAggregateRoot };
