const fs = require('fs');
const { prompt, confirm } = require('../utils/prompts');
const { registerModule, findProject, detectCurrentModule, registerFeature } = require('../utils/context');
const { scaffold, writeFile } = require('../utils/scaffold');
const { resolveGenerators, resolvePaths: resolvePathsForLang } = require('../utils/lang');
const { parseArgs } = require('../utils/parseArgs');
const { kebab, pascal } = require('../utils/names');
const path = require('path');
const { log } = require('../utils/logger');

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
async function generateCommand(argv) {
  const { args, flags } = parseArgs(argv);
  let [artefact, name] = args;

  if (!artefact) {
    artefact = await prompt(
      'What do you want to generate?\n' +
      '[1]  feature (full stack)\n' +
      '[2]  entity\n' +
      '[3]  usecase\n' +
      '[4]  port\n' +
      '[5]  controller\n' +
      '[6]  repository\n' +
      '[7]  wiring\n' +
      '[8]  dto\n' +
      '[9]  event\n' +
      '[10] error\n' +
      '[11] middleware\n> ',
      (ans) => {
        const map = {
          '1': 'feature', '2': 'entity', '3': 'usecase', '4': 'port', '5': 'controller',
          '6': 'repository', '7': 'wiring', '8': 'dto', '9': 'event', '10': 'error', '11': 'middleware'
        };
        const valid = ['feature', 'entity', 'usecase', 'port', 'controller', 'repository', 'wiring', 'dto', 'event', 'error', 'middleware'];
        return map[ans] || (valid.includes(ans) ? ans : null);
      }
    );
  }

  if (!name) {
    name = await prompt('Name of the artefact (e.g. "user", "order"):\n> ', (ans) => ans.trim() || null);
  }

  const project = findProject();
  if (!project) {
    log.error('No hexpress.config.json found. Run "hexpress init" first.');
    process.exit(1);
  }

  const { root, config } = project;
  ensureSharedAssets(root, config);

  // For monolith: detect or ask which module scope we are in
  let scope = detectCurrentModule(root, config);

  if (config.type === 'modular-monolith' && !scope && artefact !== 'middleware') {
    const modules = config.modules || [];
    if (modules.length === 0) {
      log.info('No modules found. Creating new module...');
      scope = await prompt('New module name:\n> ', (ans) => kebab(ans) || null);
      createModuleSkeleton(root, config, scope);
    } else {
      let question = 'Which module?\n';
      modules.forEach((m, i) => {
        question += `[${i + 1}] ${m}\n`;
      });
      question += `[n] Create New Module\n> `;

      const choice = await prompt(question, (ans) => {
        if (ans.toLowerCase() === 'n') return 'NEW';
        const idx = parseInt(ans, 10) - 1;
        if (idx >= 0 && idx < modules.length) return modules[idx];
        return null;
      });

      if (choice === 'NEW') {
        scope = await prompt('New module name:\n> ', (ans) => kebab(ans) || null);
        createModuleSkeleton(root, config, scope);
      } else {
        scope = choice;
      }
    }
  } else if (!scope) {
    scope = kebab(name);
  }

  switch (artefact) {
    case 'feature':
    case 'feat':
    case 'f':
      await generateFeature(root, config, scope, name, flags);
      break;
    case 'entity':
    case 'ent':
      await generateEntity(root, config, scope, name, flags);
      break;
    case 'usecase':
      await generateUseCase(root, config, scope, name);
      break;
    case 'port':
      await generatePort(root, config, scope, name);
      break;
    case 'controller':
    case 'ctr':
      await generateController(root, config, scope, name);
      break;
    case 'repository':
    case 'repo':
      await generateRepository(root, config, scope, name);
      break;
    case 'wiring':
      await generateWiring(root, config, scope, name);
      break;
    case 'dto':
      await generateDTO(root, config, scope, name);
      break;
    case 'event':
      await generateEvent(root, config, scope, name);
      break;
    case 'error':
      await generateError(root, config, scope, name);
      break;
    case 'middleware':
    case 'mid':
      await generateMiddleware(root, config, scope, name);
      break;
    default:
      log.error(`Unknown artefact "${artefact}". Choose: feature | entity | usecase | port | controller | repository | wiring | dto | event | error | middleware`);
      process.exit(1);
  }
}

async function generateMiddleware(root, config, scope, name) {
  log.title(`hexpress generate middleware · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, config.type, scope, name);
  const middlewareName = pascal(name).endsWith('Middleware') ? pascal(name) : `${pascal(name)}Middleware`;
  writeFile(p.middleware, gen.genMiddleware(name), p.rel(p.middleware));

  log.blank();
  log.success(`Middleware "${middlewareName}" created.`);
  log.blank();
}

function createModuleSkeleton(root, config, moduleName) {
  const modulePath = path.join(root, 'src', 'modules', moduleName);
  const fs = require('fs');
  if (fs.existsSync(modulePath)) return;

  scaffold(modulePath, {
    'domain/': { 'entities/': {} },
    'application/': {
      'ports/': { 'inbound/': {}, 'outbound/': {}, 'dtos/': {} },
      'use-cases/': {},
    },
    'infrastructure/': {
      'adapters/': {
        'inbound/': { 'http/': {} },
        'outbound/': { 'persistence/': {} },
      },
    },
  });
  registerModule(root, config, moduleName);
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
 * @param {string} scope        - Module scope
 * @param {string} featureName  - e.g. "user"
 * @param {object} [flags]
 */
async function generateFeature(root, config, scope, featureName, flags = {}) {
  const { type } = config;
  const lang = config.lang ?? 'js';

  log.title(`hexpress generate feature · ${pascal(featureName)}  [${type}]  [${lang}]`);
  log.blank();

  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);

  const p = resolvePaths(root, type, scope, featureName, { databasePort: true });

  writeFile(p.entity, gen.genEntity(featureName), p.rel(p.entity));
  writeFile(p.dto, gen.genDTO(featureName), p.rel(p.dto));
  writeFile(p.inboundPort, gen.genInboundPort(type, featureName), p.rel(p.inboundPort));
  writeFile(p.outboundPort, gen.genOutboundPort(type, featureName, { databasePort: true }), p.rel(p.outboundPort));
  writeFile(p.useCase, gen.genUseCase(type, featureName, { databasePort: true }), p.rel(p.useCase));
  writeFile(p.controller, gen.genController(type, featureName), p.rel(p.controller));
  writeFile(p.repository, gen.genRepository(type, featureName, { databasePort: true }), p.rel(p.repository));
  writeFile(p.wiring, gen.genWiring(featureName, type), p.rel(p.wiring));

  registerFeature(root, config, kebab(featureName));

  log.blank();
  log.success(`Feature "${pascal(featureName)}" processed.`);
  log.blank();
}

// ─── Single artefact generators ──────────────────────────────────────────────

async function generateEntity(root, config, scope, name, flags = {}) {
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

async function generateUseCase(root, config, scope, name) {
  log.title(`hexpress generate usecase · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);
  const p = resolvePaths(root, config.type, scope, name);

  // UseCase depends on: Port, DTO, OutboundPort, Entity
  let hasInbound = false;
  if (await confirm('Does it need a new Inbound Port?', true)) {
    writeFile(p.inboundPort, gen.genInboundPort(config.type, name, { minimal: true }), p.rel(p.inboundPort));
    hasInbound = true;
  }
  if (await confirm('Does it need a new Outbound Port?', true)) {
    writeFile(p.outboundPort, gen.genOutboundPort(config.type, name, { minimal: true }), p.rel(p.outboundPort));
  }
  if (await confirm('Does it need a new DTO?', true)) {
    writeFile(p.dto, gen.genDTO(name), p.rel(p.dto));
  }
  if (await confirm('Does it need a new Entity?', true)) {
    writeFile(p.entity, gen.genEntity(name), p.rel(p.entity));
  }

  writeFile(p.useCase, gen.genUseCase(config.type, name, { minimal: true, mockPort: !hasInbound }), p.rel(p.useCase));

  log.blank();
  log.success(`UseCase "${pascal(name)}UseCase" created.`);
  log.blank();
}

async function generatePort(root, config, scope, name) {
  log.title(`hexpress generate port · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);
  const p = resolvePaths(root, config.type, scope, name);

  if (await confirm('Generate Inbound Port?', true)) {
    writeFile(p.inboundPort, gen.genInboundPort(config.type, name, { minimal: true }), p.rel(p.inboundPort));
  }
  if (await confirm('Generate Outbound Port?', true)) {
    writeFile(p.outboundPort, gen.genOutboundPort(config.type, name, { minimal: true }), p.rel(p.outboundPort));
  }
  if (await confirm('Generate DTO?', true)) {
    writeFile(p.dto, gen.genDTO(name), p.rel(p.dto));
  }

  log.blank();
  log.success(`Ports for "${pascal(name)}" processed.`);
  log.blank();
}

async function generateController(root, config, scope, name) {
  log.title(`hexpress generate controller · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);
  const p = resolvePaths(root, config.type, scope, name);

  let hasInbound = false;
  if (await confirm('Does it need a new Inbound Port?', true)) {
    writeFile(p.inboundPort, gen.genInboundPort(config.type, name, { minimal: true }), p.rel(p.inboundPort));
    hasInbound = true;
  }

  writeFile(p.controller, gen.genController(config.type, name, { minimal: true, mockPort: !hasInbound }), p.rel(p.controller));

  log.blank();
  log.success(`Controller "${pascal(name)}Controller" created.`);
  log.blank();
}

async function generateRepository(root, config, scope, name) {
  log.title(`hexpress generate repository · ${pascal(name)}`);
  log.blank();

  const adapterFolder = await prompt('Outbound adapter folder (e.g. "persistence", "cache", "external"):\n[default: persistence]> ', (ans) => ans.trim() || 'persistence');

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);
  const p = resolvePaths(root, config.type, scope, name, { outboundAdapter: adapterFolder });

  let hasOutbound = false;
  if (await confirm('Does it need a new Outbound Port?', true)) {
    writeFile(p.outboundPort, gen.genOutboundPort(config.type, name, { minimal: true }), p.rel(p.outboundPort));
    hasOutbound = true;
  }

  if (await confirm('Does it need a new Entity?', true)) {
    writeFile(p.entity, gen.genEntity(name), p.rel(p.entity));
  }

  writeFile(p.repository, gen.genRepository(config.type, name, { minimal: true, mockPort: !hasOutbound }), p.rel(p.repository));

  log.blank();
  log.success(`Repository "${pascal(name)}Repository" created in ${adapterFolder}.`);
  log.blank();
}

async function generateWiring(root, config, scope, name) {
  log.title(`hexpress generate wiring · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);
  const p = resolvePaths(root, config.type, scope, name);

  writeFile(p.wiring, gen.genWiring(name, config.type, { minimal: true }), p.rel(p.wiring));

  log.blank();
  log.success(`Wiring for "${pascal(name)}" created.`);
  log.blank();
}

async function generateDTO(root, config, scope, name) {
  log.title(`hexpress generate dto · ${pascal(name)}`);
  log.blank();

  const lang = config.lang ?? 'js';
  const { resolvePaths } = resolvePathsForLang(lang);
  const gen = resolveGenerators(lang);
  const p = resolvePaths(root, config.type, scope, name);

  writeFile(p.dto, gen.genDTO(name), p.rel(p.dto));

  log.blank();
  log.success(`DTO "${pascal(name)}DTO" created.`);
  log.blank();
}

async function generateEvent(root, config, scope, name) {
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

async function generateError(root, config, scope, name) {
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

function ensureSharedAssets(root, config) {
  const lang = config.lang ?? 'js';
  const ext = lang === 'ts' ? 'ts' : 'js';
  const gen = resolveGenerators(lang);
  const sharedBase = path.join(root, 'src', 'shared');

  const assets = [
    { dir: 'domain', name: `Entity.${ext}`, content: gen.genSharedEntity() },
    { dir: 'domain', name: `AggregateRoot.${ext}`, content: gen.genSharedAggregateRoot() },
    { dir: 'application', name: `EventBus.${ext}`, content: gen.genSharedEventBus() },
    { dir: 'application', name: `MockPort.${ext}`, content: gen.genMockPort() },
  ];

  let added = false;
  for (const asset of assets) {
    const fullPath = path.join(sharedBase, asset.dir, asset.name);
    if (!fs.existsSync(fullPath)) {
      if (!added) {
        log.blank();
        log.dim('Ensuring shared base files exist...');
        log.blank();
        added = true;
      }
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, asset.content, 'utf8');
      log.blank();
      log.file(path.relative(root, fullPath));
      log.blank();
    }
  }
}

module.exports = { generateCommand, generateFeature };
