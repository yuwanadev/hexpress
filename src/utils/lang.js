'use strict';

/**
 * Resolves the correct generator module based on the language flag.
 *
 * @param {'js'|'ts'} lang
 * @returns {object} Generator functions
 */
function resolveGenerators(lang) {
  if (lang === 'ts') {
    return require('../generators/ts');
  }
  return require('../generators');
}

/**
 * Resolves the correct paths module based on the language flag.
 *
 * @param {'js'|'ts'} lang
 * @returns {{ resolvePaths: Function, resolveWiringPath: Function }}
 */
function resolvePaths(lang) {
  if (lang === 'ts') {
    return require('../generators/ts/paths');
  }
  return require('../generators/paths');
}

/**
 * Returns the file extension for the given language.
 *
 * @param {'js'|'ts'} lang
 * @returns {'js'|'ts'}
 */
function ext(lang) {
  return lang === 'ts' ? 'ts' : 'js';
}

module.exports = { resolveGenerators, resolvePaths, ext };
