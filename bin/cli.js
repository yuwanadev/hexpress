#!/usr/bin/env node
'use strict';

/**
 * hex-cli — Hexagonal Architecture Boilerplate Generator
 *
 * Commands:
 *   init    <name>             — Bootstrap a new project
 *   add     <name>             — Add module (monolith) or feature (microservice)
 *   generate <what> <name>    — Generate a single artefact inside current scope
 *   info                       — Show detected project type + modules
 */

const { parseArgs } = require('../src/utils/parseArgs');
const { log } = require('../src/utils/logger');
const { initProject } = require('../src/commands/init');
const { generateCommand } = require('../src/commands/generate');
const { infoCommand } = require('../src/commands/info');

const [, , command, ...rest] = process.argv;

const HELP = `
  Commands:
    init          <project-name>               Bootstrap a new project
    generate | g  <artefact> <name>            Generate a single artefact
    info                                       Show project type, modules, features

  Generate artefacts:
    entity        <Name>    — domain/Entity.{ts|js}
    usecase       <Name>    — application/use-cases/NameUseCase.{ts|js}
    port          <Name>    — application/ports/inbound|outbound/NamePort.{ts|js}
    event         <Name>    — domain/events/NameEvent.{ts|js}
    error         <Name>    — domain/errors/NameError.{ts|js}
    middleware    <Name>    — shared/middlewares/NameMiddleware.{ts|js}
    dto           <Name>    — dto/NameDTO.{ts|js}
    config                  — regenerate missing base config files
    feature | f   <Name>    — Full stack: port → usecase → controller+route → repository

  Flags (init):
    --type   modular-monolith | microservice   (prompted if omitted)
    --lang   js | ts                           (default: js)
    --port   HTTP port                         (default: 3000)

  Examples:
    hexpress init my-app
    hexpress init my-app --lang ts
    hexpress init user-service --type microservice --lang ts
    hexpress g f payment
    hexpress g entity Invoice
    hexpress info
`;

async function main() {
  switch (command) {
    case 'init':
      await initProject(rest);
      break;
    case 'generate':
    case 'g':
      await generateCommand(rest);
      break;
    case 'info':
      infoCommand();
      break;
    default:
      console.log(HELP);
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
