'use strict';

const path = require('path');
const { parseArgs } = require('../utils/parseArgs');
const { log } = require('../utils/logger');
const { scaffold } = require('../utils/scaffold');
const { findProject, registerModule } = require('../utils/context');
const { kebab, pascal } = require('../utils/names');
const { generateFeature } = require('./generate');

/**
 * hexpress add <name>
 *
 * Modular-monolith: creates a new module scope folder under src/modules/<name>/
 *   with only the skeleton dirs (no generated files).
 *   Use `hexpress generate feature <name>` inside the module to add features.
 *
 * Microservice: `hexpress add` is an alias for `hexpress generate feature <name>`
 *   because there is no module concept — features go straight into src/.
 */
function addCommand(argv) {
  const { args } = parseArgs(argv);
  const name = args[0];

  if (!name) {
    log.error('Name required.  Usage: hexpress add <name>');
    process.exit(1);
  }

  const project = findProject();
  if (!project) {
    log.error('No hexpress.config.json found. Run "hexpress init" first.');
    process.exit(1);
  }

  const { root, config } = project;

  if (config.type === 'microservice') {
    // In a microservice there are no module wrappers — delegate to generate feature
    log.info(`Microservice detected → delegating to "generate feature ${name}"`);
    log.blank();
    generateFeature(root, config, name);
    return;
  }

  // ── Modular monolith: create module skeleton ──────────────────────────────
  const moduleName = kebab(name);
  const modulePath = path.join(root, 'src', 'modules', moduleName);

  const fs = require('fs');
  if (fs.existsSync(modulePath)) {
    log.error(`Module "${moduleName}" already exists.`);
    process.exit(1);
  }

  log.title(`hexpress add · module "${moduleName}"`);
  log.blank();

  // Create the directory skeleton (empty dirs with .gitkeep)
  scaffold(modulePath, {
    'domain/': {
      'entities/': { '.gitkeep': '' },
    },
    'application/': {
      'ports/': {
        'inbound/': { '.gitkeep': '' },
        'outbound/': { '.gitkeep': '' },
        'dtos/': { '.gitkeep': '' },
      },
      'use-cases/': { '.gitkeep': '' },
    },
    'infrastructure/': {
      'adapters/': {
        'inbound/': {
          'http/': { '.gitkeep': '' },
        },
        'outbound/': {
          'persistence/': { '.gitkeep': '' },
        },
      },
    },
  });

  registerModule(root, config, moduleName);

  log.blank();
  log.success(`Module "${moduleName}" created.`);
  log.blank();
  log.info('Generate a feature inside it:');
  log.dim(`  cd src/modules/${moduleName}`);
  log.dim(`  hexpress generate feature ${moduleName}`);
  log.blank();
  log.info('Or generate individual artefacts:');
  log.dim(`  hexpress generate entity  ${pascal(name)}`);
  log.dim(`  hexpress generate usecase ${pascal(name)}`);
  log.blank();
}

module.exports = { addCommand };
