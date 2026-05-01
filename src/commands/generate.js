'use strict';

const path = require('path');
const { parseArgs } = require('../utils/parseArgs');
const { log } = require('../utils/logger');
const { writeFile } = require('../utils/scaffold');
const { findProject, detectCurrentModule, registerFeature } = require('../utils/context');
const { resolveGenerators, resolvePaths: resolvePathsForLang } = require('../utils/lang');
const { pascal, kebab } = require('../utils/names');

/**
 * hexpress generate <artefact> <n> [--aggregate]
 *
 * artefacts:
 *   feature   — full stack (port → dto → usecase → controller → repository → wiring)
 *   entity    — domain/entities/Name.{ts|js}
 *   usecase   — application/use-cases/NameUseCase.{ts|js}
 *   port      — inbound + outbound ports
 *   event     — domain/events/NameEvent.{ts|js}
 *   error     — domain/errors/NameError.{ts|js}
 */
function generateCommand(argv) {
  const { args, flags } = parseArgs(argv);
  const [artefact, name] = args;

  if (!artefact || !name) {
    log.error('Usage: hexpress generate <artefact> <n>');
    log.dim('  artefacts: feature | entity | usecase | port | event | error');
    process.exit(1);
  }

  const project = findProject();
  if (!project) {
    log.error('No hexpress.config.json found. Run "hexpress init" first.');
    process.exit(1);
  }

  const { root, config } = project;

  // For monolith: detect which module scope we are in (from cwd)
  const currentModule = detectCurrentModule(root, config);
  const scope = currentModule ?? kebab(name); // microservice: scope = feature name

  switch (artefact) {
    case 'feature':
      generateFeature(root, config, name, flags);
      break;
    case 'entity':
      generateEntity(root, config, scope, name, flags);
      break;
    case 'usecase':
      generateUseCase(root, config, scope, name);
      break;
    case 'port':
      generatePort(root, config, scope, name);
      break;
    case 'event':
      generateEvent(root, config, scope, name);
      break;
    case 'error':
      generateError(root, config, scope, name);
      break;
    default:
      log.error(`Unknown artefact "${artefact}". Choose: feature | entity | usecase | port | event | error`);
      process.exit(1);
  }
}

// ─── Feature (full stack) ────────────────────────────────────────────────────

/**
 * Generates the complete vertical slice for a feature:
 *   1. domain/entities/Name.{ts|js}
 *   2. application/ports/dtos/NameDTO.{ts|js}
 *   3. application/ports/inbound/NamePort.{ts|js}
 *   4. application/ports/outbound/NameDatabasePort.{ts|js}
 *   5. application/use-cases/NameUseCase.{ts|js}
 *   6. infrastructure/adapters/inbound/http/NameController.{ts|js}
 *   7. infrastructure/adapters/outbound/persistence/NameRepository.{ts|js}
 *   8. wiring file (module.{ts|js} or wiring.{ts|js})
 *
 * @param {string} root         - Project root
 * @param {object} config       - hexpress.config.json
 * @param {string} featureName  - e.g. "user"
 * @param {object} [flags]
 */
function generateFeature(root, config, featureName, flags = {}) {
  const { type } = config;
  const lang = config.lang ?? 'js';

  // For monolith, scope is the module the user is currently in (or same name)
  const currentModule = detectCurrentModule(root, config);
  const scope = currentModule ?? kebab(featureName);

  // For monolith, validate the module exists
  if (type === 'modular-monolith' && !currentModule) {
    log.warn(`Not inside a module directory. Generating into module "${scope}".`);
  }

  log.title(`hexpress generate feature · ${pascal(featureName)}  [${type}]  [${lang}]`);
  log.blank();

  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, type, scope, featureName);

  writeFile(p.entity, gen.genEntity(featureName), p.rel(p.entity));
  writeFile(p.dto, gen.genDTO(featureName), p.rel(p.dto));
  writeFile(p.inboundPort, gen.genInboundPort(featureName), p.rel(p.inboundPort));
  writeFile(p.outboundPort, gen.genOutboundPort(featureName), p.rel(p.outboundPort));
  writeFile(p.useCase, gen.genUseCase(type, featureName), p.rel(p.useCase));
  writeFile(p.controller, gen.genController(featureName), p.rel(p.controller));
  writeFile(p.repository, gen.genRepository(type, featureName), p.rel(p.repository));
  writeFile(p.wiring, gen.genWiring(featureName, type), p.rel(p.wiring));

  registerFeature(root, config, kebab(featureName));

  log.blank();
  log.success(`Feature "${pascal(featureName)}" generated.`);
  log.blank();
  log.info('Wire it up in src/app.' + (lang === 'ts' ? 'ts' : 'js') + ':');
  if (type === 'modular-monolith') {
    log.dim(`  import { compose${pascal(featureName)}Module } from './modules/${scope}/${scope}.module.js';`);
    log.dim(`  compose${pascal(featureName)}Module({ model, router });`);
  } else {
    log.dim(`  import { compose${pascal(featureName)} } from './${kebab(featureName)}.wiring.js';`);
    log.dim(`  compose${pascal(featureName)}({ model, router });`);
  }
  log.blank();
}

// ─── Single artefact generators ──────────────────────────────────────────────

function generateEntity(root, config, scope, name, flags = {}) {
  log.title(`hexpress generate entity · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, config.type, scope, name);
  const code = flags.aggregate ? gen.genAggregateRoot(name) : gen.genEntity(name);
  writeFile(p.entity, code, p.rel(p.entity));

  log.blank();
  log.success(`Entity "${pascal(name)}" created.`);
  if (!flags.aggregate) log.dim('  Tip: use --aggregate to generate an AggregateRoot instead.');
  log.blank();
}

function generateUseCase(root, config, scope, name) {
  log.title(`hexpress generate usecase · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, config.type, scope, name);
  writeFile(p.useCase, gen.genUseCase(config.type, name), p.rel(p.useCase));

  log.blank();
  log.success(`UseCase "${pascal(name)}UseCase" created.`);
  log.blank();
}

function generatePort(root, config, scope, name) {
  log.title(`hexpress generate port · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, config.type, scope, name);
  writeFile(p.inboundPort, gen.genInboundPort(name), p.rel(p.inboundPort));
  writeFile(p.outboundPort, gen.genOutboundPort(name), p.rel(p.outboundPort));
  writeFile(p.dto, gen.genDTO(name), p.rel(p.dto));

  log.blank();
  log.success(`Ports for "${pascal(name)}" created.`);
  log.blank();
}

function generateEvent(root, config, scope, name) {
  log.title(`hexpress generate event · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, config.type, scope, name);
  const evtName = pascal(name).endsWith('Event') ? pascal(name) : `${pascal(name)}Event`;
  const filePath = p.domainEvent(evtName);
  writeFile(filePath, gen.genDomainEvent(evtName, name), p.rel(filePath));

  log.blank();
  log.success(`Domain event "${evtName}" created.`);
  log.blank();
}

function generateError(root, config, scope, name) {
  log.title(`hexpress generate error · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, config.type, scope, name);
  const errName = pascal(name).endsWith('Error') ? pascal(name) : `${pascal(name)}Error`;
  const filePath = p.domainError(errName);
  writeFile(filePath, gen.genDomainError(errName), p.rel(filePath));

  log.blank();
  log.success(`Domain error "${errName}" created.`);
  log.blank();
}

module.exports = { generateCommand, generateFeature };
