'use strict';

const fs = require('fs');
const path = require('path');
const { log, c } = require('../utils/logger');
const { findProject } = require('../utils/context');

/**
 * hexpress info — Shows project type, language, modules/features, and structure overview.
 */
function infoCommand() {
  const project = findProject();

  if (!project) {
    log.error('No hexpress.config.json found. Run "hexpress init <n>" to initialise a project.');
    process.exit(1);
  }

  const { root, config } = project;
  const lang = config.lang ?? 'js';

  log.title('hexpress-cli · Project Info');

  console.log(`  ${c.bold}Name${c.reset}   ${path.basename(root)}`);
  console.log(`  ${c.bold}Type${c.reset}   ${config.type}`);
  console.log(`  ${c.bold}Lang${c.reset}   ${lang === 'ts' ? 'TypeScript' : 'JavaScript'}`);
  console.log(`  ${c.bold}Port${c.reset}   ${config.port ?? 3000}`);
  console.log(`  ${c.bold}Root${c.reset}   ${root}`);
  log.blank();

  if (config.type === 'modular-monolith') {
    const modules = config.modules ?? [];
    console.log(`  ${c.bold}${c.cyan}Modules (${modules.length})${c.reset}`);
    if (modules.length === 0) {
      log.dim('  none yet — run: hexpress add <module-name>');
    } else {
      modules.forEach(m => {
        const features = listFeatures(path.join(root, 'src', 'modules', m), lang);
        console.log(`  ${c.green}✔${c.reset} ${m}`);
        features.forEach(f => log.dim(`    └─ ${f}`));
      });
    }
  } else {
    const features = config.features ?? [];
    console.log(`  ${c.bold}${c.cyan}Features (${features.length})${c.reset}`);
    if (features.length === 0) {
      log.dim('  none yet — run: hexpress generate feature <n>');
    } else {
      features.forEach(f => console.log(`  ${c.green}✔${c.reset} ${f}`));
    }
  }

  log.blank();
  console.log(`  ${c.bold}Commands${c.reset}`);
  if (config.type === 'modular-monolith') {
    log.dim('  hexpress add <n>                      Add a new module');
    log.dim('  hexpress generate feature <n>         Full feature inside current module');
  } else {
    log.dim('  hexpress generate feature <n>         Full vertical feature slice');
  }
  log.dim('  hexpress generate entity|usecase|port|event|error <n>');
  log.blank();
}

/**
 * Scan a module directory and list entity names (proxy for "features").
 */
function listFeatures(modulePath, lang = 'js') {
  const entitiesDir = path.join(modulePath, 'domain', 'entities');
  if (!fs.existsSync(entitiesDir)) return [];
  const ext = lang === 'ts' ? '.ts' : '.js';
  return fs.readdirSync(entitiesDir)
    .filter(f => f.endsWith(ext) && f !== '.gitkeep')
    .map(f => f.replace(ext, ''));
}

module.exports = { infoCommand };
