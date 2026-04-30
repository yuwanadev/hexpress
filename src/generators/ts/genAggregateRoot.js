'use strict';

const { pascal } = require('../../utils/names');

function genAggregateRoot(name) {
  const Name = pascal(name);
  return `/**
 * ${Name} — Aggregate Root
 *
 * Extends domain entity with domain event tracking.
 */

export interface ${Name}Props {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ${Name}Persistence {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export class ${Name} {
  public readonly id: string;
  public createdAt: Date;
  public updatedAt: Date;

  #domainEvents: DomainEvent[] = [];

  constructor({ id, createdAt, updatedAt }: ${Name}Props) {
    this.id        = id;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  // ── Domain Events ─────────────────────────────────────────────────────────

  addDomainEvent(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }

  // ── Mapper ───────────────────────────────────────────────────────────────

  static toDomain(record: ${Name}Persistence): ${Name} {
    return new ${Name}({
      id:        record.id,
      createdAt: new Date(record.created_at ?? record.updated_at),
      updatedAt: new Date(record.updated_at ?? record.created_at),
    });
  }

  toPersistence(): ${Name}Persistence {
    return {
      id:         this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  toJSON(): ${Name}Props {
    return {
      id:        this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
`;
}

module.exports = { genAggregateRoot };
