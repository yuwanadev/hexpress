# Hexpress CLI — Yuwanadev

> Base principle: **Ports & Adapters**. The domain core is completely isolated.
> Inbound = driving side (HTTP, CLI, events coming IN).
> Outbound = driven side (DB, external APIs, queues going OUT).

---

## Quick Start

Standardize your development with the **Hexpress CLI**.

### Installation

```bash
# Install globally
npm i -g @yuwanadev/hexpress
```

For full authentication details and local setup, see [SETUP.md](./SETUP.md).

---

## 1. Modular Monolith

Best for: teams starting out, single deployable unit, bounded contexts as modules.

```
project-root/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── User.js                  # Pure domain object
│   │   │   │   ├── value-objects/
│   │   │   │   │   └── Email.js
│   │   │   │   ├── events/
│   │   │   │   │   └── UserCreated.js            # Domain event
│   │   │   │   └── errors/
│   │   │   │       └── UserNotFoundError.js
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── inbound/
│   │   │   │   │   │   └── ICreateUserUseCase.js  # Interface (port)
│   │   │   │   │   └── outbound/
│   │   │   │   │       ├── IUserRepository.js     # Interface (port)
│   │   │   │   │       └── IEmailService.js       # Interface (port)
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── CreateUserUseCase.js
│   │   │   │   │   └── GetUserUseCase.js
│   │   │   │   └── dtos/
│   │   │   │       ├── CreateUserDTO.js
│   │   │   │       └── UserResponseDTO.js
│   │   │   │
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── inbound/
│   │   │       │   │   ├── http/
│   │   │       │   │   │   ├── UserController.js  # Express/Fastify controller
│   │   │       │   │   │   └── UserRouter.js
│   │   │       │   │   └── event/
│   │   │       │   │       └── UserEventConsumer.js # Internal event listener
│   │   │       │   └── outbound/
│   │   │       │       ├── persistence/
│   │   │       │       │   ├── UserRepository.js  # Implements IUserRepository
│   │   │       │       │   └── UserMapper.js      # Domain <-> DB model
│   │   │       │       └── external/
│   │   │       │           └── SendgridEmailAdapter.js
│   │   │       └── models/
│   │   │           └── UserModel.js               # ORM schema
│   │   │
│   │   ├── order/                                 # Same structure per module
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   │
│   │   └── product/
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   ├── shared/
│   │   ├── domain/
│   │   │   ├── AggregateRoot.js
│   │   │   ├── Entity.js
│   │   │   ├── ValueObject.js
│   │   │   └── DomainEvent.js
│   │   ├── application/
│   │   │   ├── UseCase.js                        # Base use case contract
│   │   │   └── EventBus.js                       # In-process event bus
│   │   └── infrastructure/
│   │       ├── database/
│   │       │   └── connection.js
│   │       └── logger/
│   │           └── logger.js
│   │
│   └── app.js                                    # Compose & wire DI
│
├── config/
│   ├── default.js
│   ├── development.js
│   └── production.js
│
├── tests/
│   ├── unit/
│   │   └── modules/user/
│   ├── integration/
│   │   └── modules/user/
│   └── e2e/
│
├── package.json
└── index.js
```

### Key Rules — Modular Monolith

- Modules **never** import from each other directly — they communicate via `shared/EventBus`
- `domain/` has **zero** external dependencies (no ORM, no framework)
- `application/ports/inbound/` = what the outside world can ask the module to do
- `application/ports/outbound/` = what the module needs from the outside world

---

## 2. Microservices

Best for: independent scaling, independent deployments, team autonomy per service.
Each service is a **standalone repo** (or a monorepo workspace) with the same hexagonal layers.

```
services/
├── user-service/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── User.js
│   │   │   ├── value-objects/
│   │   │   │   └── Email.js
│   │   │   ├── events/
│   │   │   │   └── UserCreated.js
│   │   │   └── errors/
│   │   │       └── UserNotFoundError.js
│   │   │
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   ├── inbound/
│   │   │   │   │   ├── ICreateUserUseCase.js
│   │   │   │   │   └── IHandleUserCommand.js    # For command bus
│   │   │   │   └── outbound/
│   │   │   │       ├── IUserRepository.js
│   │   │   │       ├── IEventPublisher.js       # Outbound broker port
│   │   │   │       └── INotificationService.js
│   │   │   ├── use-cases/
│   │   │   │   ├── CreateUserUseCase.js
│   │   │   │   └── UpdateUserUseCase.js
│   │   │   └── dtos/
│   │   │       └── CreateUserDTO.js
│   │   │
│   │   └── infrastructure/
│   │       ├── adapters/
│   │       │   ├── inbound/
│   │       │   │   ├── http/
│   │       │   │   │   ├── UserController.js
│   │       │   │   │   └── UserRouter.js
│   │       │   │   └── messaging/
│   │       │   │       └── UserCommandConsumer.js  # RabbitMQ/Kafka consumer
│   │       │   └── outbound/
│   │       │       ├── persistence/
│   │       │       │   ├── UserRepository.js
│   │       │       │   └── UserMapper.js
│   │       │       ├── messaging/
│   │       │       │   └── KafkaEventPublisher.js  # Implements IEventPublisher
│   │       │       └── external/
│   │       │           └── NotificationServiceClient.js  # gRPC/HTTP client
│   │       ├── models/
│   │       │   └── UserModel.js
│   │       └── server.js
│   │
│   ├── config/
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
│
├── order-service/                               # Same structure
│   └── src/ ...
│
├── product-service/
│   └── src/ ...
│
└── shared-libs/                                 # Published as internal npm packages
    ├── @company/domain-base/
    │   ├── AggregateRoot.js
    │   ├── Entity.js
    │   ├── ValueObject.js
    │   └── DomainEvent.js
    ├── @company/event-contracts/                # Shared event schema/types
    │   └── events/
    │       └── UserCreated.js
    └── @company/logger/
        └── index.js
```

### Key Rules — Microservices

- Each service owns its **own database** (no shared DB schemas)
- `inbound/messaging/` = consumes commands/events from broker
- `outbound/messaging/` = publishes domain events to broker
- `shared-libs/` are **read-only contracts**, never business logic

---

## 3. Message Broker Architecture (Event-Driven)

Best for: async workflows, eventual consistency, decoupled producers/consumers.
Can be used standalone or layered on top of microservices.

```
project-root/
├── src/
│   ├── bounded-contexts/
│   │   ├── user/
│   │   │   ├── domain/
│   │   │   │   ├── entities/User.js
│   │   │   │   ├── value-objects/Email.js
│   │   │   │   └── events/
│   │   │   │       ├── UserCreated.js           # Domain event (source of truth)
│   │   │   │       ├── UserUpdated.js
│   │   │   │       └── UserDeleted.js
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── inbound/
│   │   │   │   │   │   ├── ICreateUserUseCase.js
│   │   │   │   │   │   └── IUserCommandHandler.js    # Handle commands from broker
│   │   │   │   │   └── outbound/
│   │   │   │   │       ├── IUserRepository.js
│   │   │   │   │       ├── IEventStore.js            # Append-only event log
│   │   │   │   │       └── IEventPublisher.js        # Publish to broker
│   │   │   │   ├── use-cases/
│   │   │   │   │   └── CreateUserUseCase.js
│   │   │   │   ├── command-handlers/
│   │   │   │   │   └── CreateUserCommandHandler.js
│   │   │   │   └── event-handlers/
│   │   │   │       └── HandleOrderCreatedEvent.js   # React to other domains
│   │   │   │
│   │   │   └── infrastructure/
│   │   │       ├── adapters/
│   │   │       │   ├── inbound/
│   │   │       │   │   ├── http/
│   │   │       │   │   │   └── UserController.js
│   │   │       │   │   └── messaging/
│   │   │       │   │       ├── consumers/
│   │   │       │   │       │   ├── CreateUserConsumer.js   # Kafka/RabbitMQ
│   │   │       │   │       │   └── OrderCreatedConsumer.js
│   │   │       │   │       └── handlers/
│   │   │       │   │           └── UserCommandRouter.js    # Routes to use-cases
│   │   │       │   └── outbound/
│   │   │       │       ├── persistence/
│   │   │       │       │   ├── UserRepository.js
│   │   │       │       │   └── UserMapper.js
│   │   │       │       └── messaging/
│   │   │       │           ├── publishers/
│   │   │       │           │   ├── KafkaEventPublisher.js
│   │   │       │           │   └── RabbitMQEventPublisher.js
│   │   │       │           └── schemas/
│   │   │       │               └── UserCreatedSchema.js    # Avro/JSON schema
│   │   │       └── models/
│   │   │           └── UserModel.js
│   │   │
│   │   └── order/                              # Same structure
│   │       └── ...
│   │
│   ├── shared/
│   │   ├── messaging/
│   │   │   ├── brokers/
│   │   │   │   ├── KafkaClient.js             # Shared broker connection
│   │   │   │   └── RabbitMQClient.js
│   │   │   ├── BaseConsumer.js
│   │   │   └── BasePublisher.js
│   │   ├── event-store/
│   │   │   └── EventStoreAdapter.js
│   │   └── domain/
│   │       ├── AggregateRoot.js
│   │       ├── DomainEvent.js
│   │       └── EventEmitter.js
│   │
│   └── app.js
│
├── contracts/                                  # Shared event/command contracts
│   ├── events/
│   │   ├── user.events.js
│   │   └── order.events.js
│   ├── commands/
│   │   ├── user.commands.js
│   │   └── order.commands.js
│   └── schemas/                               # Avro / Protobuf / JSON schemas
│       └── user-created.avsc
│
├── config/
│   ├── kafka.js
│   └── rabbitmq.js
│
├── tests/
├── docker-compose.yml                         # Kafka + Zookeeper + App
├── package.json
└── index.js
```

---

## Inbound vs Outbound — Quick Reference

| Layer                 | Inbound Adapters              | Outbound Adapters                |
| --------------------- | ----------------------------- | -------------------------------- |
| **HTTP**              | Controller, Router            | HTTP Client (Axios, fetch)       |
| **Messaging**         | Consumer, Subscriber          | Publisher, Producer              |
| **CLI**               | Command Runner                | —                                |
| **Ports (interface)** | `IUseCase`, `ICommandHandler` | `IRepository`, `IEventPublisher` |

---

## Dependency Rule (Non-negotiable)

```
Infrastructure  →  Application  →  Domain
     (adapters)      (use-cases)    (entities)

NEVER reverse this arrow.
Domain knows nothing about Express, Kafka, Postgres, or any framework.
```

---

## Recommendation

| Scenario                                   | Architecture                                          |
| ------------------------------------------ | ----------------------------------------------------- |
| Small team, single repo, fast iteration    | **Modular Monolith**                                  |
| Multiple teams, independent deployments    | **Microservices**                                     |
| High async workloads, eventual consistency | **Message Broker / Event-Driven**                     |
| Starting monolith, planning to extract     | **Modular Monolith** → extract to Microservices later |

The hexagonal structure is **identical in all three** — only the transport layer (inbound/outbound adapters) changes.
