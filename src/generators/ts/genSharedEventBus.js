'use strict';

function genSharedEventBus() {
  return `export interface IDomainEvent {
  eventName: string;
  [key: string]: unknown;
}

type EventHandler = (event: IDomainEvent) => Promise<void>;

/**
 * EventBus — In-process pub/sub for modular monolith.
 * For microservices, swap with a broker adapter.
 */
export class EventBus {
  #handlers: Record<string, EventHandler[]> = {};

  subscribe(eventName: string, handler: EventHandler): void {
    (this.#handlers[eventName] ??= []).push(handler);
  }

  async publish(event: IDomainEvent): Promise<void> {
    const handlers = this.#handlers[event.eventName] ?? [];
    await Promise.all(handlers.map(h => h(event)));
  }
}
`;
}

module.exports = { genSharedEventBus };
