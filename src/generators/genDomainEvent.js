'use strict';

const { pascal } = require('../utils/names');

function genDomainEvent(name, entityName) {
  const Name       = pascal(name);
  const EntityName = pascal(entityName ?? name.replace(/Event$/, ''));
  return `/**
 * ${Name} — Domain Event
 * Immutable. Represents something that happened in the domain.
 */
export class ${Name} {
  constructor({ aggregateId, payload = {} }) {
    this.eventName   = '${Name}';
    this.aggregateId = aggregateId;
    this.payload     = payload;
    this.occurredAt  = new Date();
    Object.freeze(this);
  }
}
`;
}

module.exports = { genDomainEvent };
