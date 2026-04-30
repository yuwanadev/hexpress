'use strict';

const fs   = require('fs');
const path = require('path');
const { log } = require('./logger');

/**
 * Recursively writes a file tree to disk.
 *
 * Tree format:
 *   { 'folder/': { 'file.js': 'content' }, 'file.js': 'content' }
 *
 * Keys ending '/' → directories.
 * String values   → file content.
 *
 * @param {string} base  - Absolute base path
 * @param {object} tree  - Nested definition
 * @param {string} [rel] - Relative path (for display)
 */
function scaffold(base, tree, rel = '') {
  for (const [name, value] of Object.entries(tree)) {
    const fullPath = path.join(base, name);
    const relPath  = path.join(rel, name);

    if (typeof value === 'object' && value !== null) {
      fs.mkdirSync(fullPath, { recursive: true });
      scaffold(fullPath, value, relPath);
    } else {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });

      if (fs.existsSync(fullPath)) {
        log.warn(`Skipped (exists): ${relPath}`);
      } else {
        fs.writeFileSync(fullPath, value, 'utf8');
        log.file(relPath);
      }
    }
  }
}

/**
 * Write a single file, logging its path.
 * @param {string} filePath - Absolute path
 * @param {string} content
 * @param {string} [display] - Relative path shown in log
 */
function writeFile(filePath, content, display) {
  if (fs.existsSync(filePath)) {
    log.warn(`Skipped (exists): ${display ?? filePath}`);
    return false;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  log.file(display ?? filePath);
  return true;
}

module.exports = { scaffold, writeFile };
