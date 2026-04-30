# Hexpress CLI

Standardize your development with **Hexpress**, a Hexagonal Architecture (Ports & Adapters) boilerplate generator for Node.js.

## Quick Start

### Installation

```bash
npm install -g @yuwanadev/hexpress
```

### Initialize Project

```bash
hexpress init my-app
cd my-app
```

### Core Commands

| Command | Description |
| --- | --- |
| `hexpress init <name>` | Create a new Hexagonal project |
| `hexpress add <module>` | Add a new module (Monolith structure) |
| `hexpress generate <type>` | Generate entities, use-cases, or ports |

## Architecture at a Glance

Hexpress enforces a strict separation of concerns:
- **Domain**: Pure business logic (Entities, Value Objects).
- **Application**: Use Cases and Ports (Inbound/Outbound interfaces).
- **Infrastructure**: Adapters (Express controllers, DB repositories, External APIs).

For detailed setup instructions, see [SETUP.md](./SETUP.md).

---
Built with ❤️ by **Yuwana**
