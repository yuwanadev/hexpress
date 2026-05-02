'use strict';

function genMockPort() {
  return `/**
 * IMockPort — Placeholder for ports not yet implemented.
 * This prevents compilation/import errors when generating single artefacts.
 */
export interface IMockPort {
  // TODO: Define specific port methods
}
`;
}

module.exports = { genMockPort };
