'use strict';

function genSharedEventBus() {
  return `/**
 * EventBus — In-process pub/sub for modular monolith.
 * For microservices, swap with a broker adapter.
 */
export class EventBus {
  #handlers = {};

  subscribe(eventName, handler) {
    (this.#handlers[eventName] ??= []).push(handler);
  }

  async publish(event) {
    const handlers = this.#handlers[event.eventName] ?? [];
    await Promise.all(handlers.map(h => h(event)));
  }
}
`;
}

module.exports = { genSharedEventBus };
