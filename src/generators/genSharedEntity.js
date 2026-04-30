'use strict';

function genSharedEntity() {
  return `/**
 * Entity — Base class for all domain entities.
 * Equality by identity (id), not reference.
 */
export class Entity {
  constructor({ id }) {
    if (!id) throw new Error('Entity requires an id');
    this.id = id;
  }

  equals(other) {
    return other instanceof Entity && other.id === this.id;
  }
}
`;
}

module.exports = { genSharedEntity };
