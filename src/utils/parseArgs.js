'use strict';

/**
 * Minimal CLI arg parser — no external deps.
 *
 * Parses: positional args and --flag [value] pairs.
 * Returns: { args: string[], flags: Record<string, string|true> }
 */
function parseArgs(argv) {
  const flags = {};
  const args  = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key  = camel(token.slice(2));
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { flags[key] = next; i++; }
      else flags[key] = true;
    } else {
      args.push(token);
    }
  }

  return { args, flags };
}

function camel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

module.exports = { parseArgs };
