'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = 'hexpress.config.json';

/**
 * Walks up from cwd looking for hexpress.config.json.
 * Returns { root, config } or null.
 */
function findProject(fromDir = process.cwd()) {
  let dir = fromDir;
  while (true) {
    const candidate = path.join(dir, CONFIG_FILE);
    if (fs.existsSync(candidate)) {
      const config = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      return { root: dir, config };
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Detect which module/bounded-context the cwd is inside (for monolith).
 * Returns module name string or null.
 */
function detectCurrentModule(root, config) {
  if (config.type !== 'modular-monolith') return null;

  const cwd = process.cwd();
  const modsRoot = path.join(root, 'src', 'modules');
  const rel = path.relative(modsRoot, cwd);
  if (rel.startsWith('..')) return null;

  const parts = rel.split(path.sep);
  return parts[0] || null;
}

/**
 * Write / update hexpress.config.json.
 */
function writeConfig(root, config) {
  fs.writeFileSync(
    path.join(root, CONFIG_FILE),
    JSON.stringify(config, null, 2),
    'utf8'
  );
}

/**
 * Register a new module in the config (monolith) or feature (microservice).
 */
function registerModule(root, config, name) {
  config.modules = config.modules ?? [];
  if (!config.modules.includes(name)) {
    config.modules.push(name);
    writeConfig(root, config);
  }
}

function registerFeature(root, config, feature) {
  config.features = config.features ?? [];
  if (!config.features.includes(feature)) {
    config.features.push(feature);
    writeConfig(root, config);
  }
}

module.exports = {
  findProject,
  detectCurrentModule,
  writeConfig,
  registerModule,
  registerFeature,
};
