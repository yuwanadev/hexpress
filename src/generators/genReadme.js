'use strict';

function genReadme(name, type) {
  return `# ${name}

> Hexagonal Architecture · ${type} · ESM

## Layers

\`\`\`
domain/                  Pure business objects (zero deps)
application/ports/       Inbound + outbound interface contracts
application/use-cases/   Implements inbound ports, consumes outbound ports
infrastructure/adapters/ Concrete adapters (HTTP, DB, broker)
\`\`\`

## Getting Started

\`\`\`bash
cp .env.example .env
npm install
npm run dev
\`\`\`

## CLI

\`\`\`bash
# Add a module (monolith) or feature (microservice)
hexpress add <name>

# Generate a single artefact
hexpress generate feature   <name>   # full stack
hexpress generate entity    <Name>
hexpress generate usecase   <name>
hexpress generate port      <name>
hexpress generate event     <name>
hexpress generate error     <name>

# Project info
hexpress info
\`\`\`
`;
}

module.exports = { genReadme };
