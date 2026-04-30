'use strict';

const { pascal } = require('../utils/names');

function genAggregateRoot(name) {
  const Name = pascal(name);
  return `/**
 * ${Name} — Aggregate Root
 *
 * Extends domain entity with domain event tracking.
 */
export class ${Name} {
  #domainEvents = [];

  constructor({ id, createdAt, updatedAt }) {
    this.id        = id;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  // ── Domain Events ─────────────────────────────────────────────────────────

  addDomainEvent(event) {
    this.#domainEvents.push(event);
  }

  pullDomainEvents() {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }

  // ── Mapper ───────────────────────────────────────────────────────────────

  static toDomain(record) {
    return new ${Name}({
      id:        record.id,
      createdAt: new Date(record.created_at ?? record.createdAt),
      updatedAt: new Date(record.updated_at ?? record.updatedAt),
    });
  }

  toPersistence() {
    return {
      id:         this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  toJSON() {
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
