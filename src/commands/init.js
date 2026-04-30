'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { parseArgs } = require('../utils/parseArgs');
const { log } = require('../utils/logger');
const { scaffold } = require('../utils/scaffold');
const { writeConfig } = require('../utils/context');
const { resolveGenerators } = require('../utils/lang');

const VALID_TYPES = ['modular-monolith', 'microservice'];
const VALID_LANGS = ['js', 'ts'];

/**
 * hexpress init <project-name> [--type modular-monolith|microservice] [--port 3000] [--lang js|ts]
 */
async function initProject(argv) {
  const { args, flags } = parseArgs(argv);
  const projectName = args[0];

  if (!projectName) {
    log.error('Project name required.  Usage: hexpress init <project-name>');
    process.exit(1);
  }

  // ── Prompt for type if not given ─────────────────────────────────────────
  let type = flags.type;
  if (!type) {
    type = await prompt(
      '  Architecture type?\n  [1] modular-monolith  [2] microservice\n  > ',
      (ans) => {
        if (ans === '1' || ans === 'modular-monolith') return 'modular-monolith';
        if (ans === '2' || ans === 'microservice') return 'microservice';
        return null;
      }
    );
  }

  if (!VALID_TYPES.includes(type)) {
    log.error(`Invalid type "${type}". Choose: ${VALID_TYPES.join(' | ')}`);
    process.exit(1);
  }

  // ── Prompt for language if not given ────────────────────────────────────
  let lang = flags.lang ?? 'js';
  if (!VALID_LANGS.includes(lang)) {
    log.error(`Invalid lang "${lang}". Choose: ${VALID_LANGS.join(' | ')}`);
    process.exit(1);
  }

  const port = parseInt(flags.port ?? '3000', 10);
  const dest = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(dest)) {
    log.error(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  log.title(`hexpress init · ${projectName}  [${type}]  [${lang}]`);
  log.blank();

  // ── Resolve generators based on language ──────────────────────────────────
  const gen = resolveGenerators(lang);

  // ── Core shared files (always generated) ─────────────────────────────────
  const ext = lang === 'ts' ? 'ts' : 'js';
  const sharedInfra = {
    'http/': {
      [`errorHandler.${ext}`]: gen.genSharedErrorHandler(),
    },
  };

  const shared = {
    'domain/': {
      [`Entity.${ext}`]: gen.genSharedEntity(),
      [`AggregateRoot.${ext}`]: gen.genSharedAggregateRoot(),
    },
    'application/': {
      [`EventBus.${ext}`]: gen.genSharedEventBus(),
    },
    'infrastructure/': sharedInfra,
  };

  // ── Project tree (minimal — no placeholder modules) ───────────────────────
  const tree = {
    'package.json': gen.genPackageJson(projectName, type),
    '.gitignore': gen.genGitignore(),
    '.env.example': gen.genEnv(port, type),
    'README.md': gen.genReadme(projectName, type),
    ...(lang === 'ts'
      ? {
          'tsconfig.json': gen.genTsConfig(),
          [`index.${ext}`]: gen.genIndexTs(port),
          'src/': {
            'shared/': shared,
            [`app.${ext}`]: gen.genAppTs(type),
            ...(type === 'modular-monolith' ? { 'modules/': {} } : {}),
          },
        }
      : {
          [`index.${ext}`]: gen.genIndexJs(port),
          'src/': {
            'shared/': shared,
            [`app.${ext}`]: gen.genAppJs(type),
            ...(type === 'modular-monolith' ? { 'modules/': {} } : {}),
          },
        }
    ),
    'tests/': {
      'unit/': { '.gitkeep': '' },
      'integration/': { '.gitkeep': '' },
    },
  };

  scaffold(dest, tree);

  // ── Write project config ──────────────────────────────────────────────────
  writeConfig(dest, {
    type,
    lang,
    port,
    modules: type === 'modular-monolith' ? [] : undefined,
    features: type === 'microservice' ? [] : undefined,
  });
  log.file('hexpress.config.json');

  // ── Done ──────────────────────────────────────────────────────────────────
  log.blank();
  log.success(`Project "${projectName}" initialised!`);
  log.blank();
  log.info('Next steps:');
  log.dim(`  cd ${projectName}`);
  log.dim('  npm install');
  log.dim('  cp .env.example .env');
  log.blank();
  log.info('Scaffold your first feature:');

  if (type === 'modular-monolith') {
    log.dim('  hexpress add user              ← new module');
    log.dim('  hexpress generate feature order   ← full feature inside current module');
  } else {
    log.dim('  hexpress generate feature user   ← full feature (port → usecase → controller → repo)');
    log.dim('  hexpress generate entity  Invoice');
  }
  log.blank();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function prompt(question, validate) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = () => {
      rl.question(question, (ans) => {
        const result = validate(ans.trim());
        if (result !== null) { rl.close(); resolve(result); }
        else { log.warn('Invalid option. Try again.'); ask(); }
      });
    };
    ask();
  });
}

module.exports = { initProject };
