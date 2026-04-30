'use strict';

function genSharedEntity() {
  return `/**
 * Entity — Base class for all domain entities.
 * Equality by identity (id), not reference.
 */
export abstract class Entity {
  public readonly id: string;

  constructor({ id }: { id: string }) {
    if (!id) throw new Error('Entity requires an id');
    this.id = id;
  }

  equals(other: Entity): boolean {
    return other instanceof Entity && other.id === this.id;
  }
}
`;
}

module.exports = { genSharedEntity };
