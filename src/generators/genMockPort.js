'use strict';

function genMockPort() {
  return `/**
 * MockPort — Placeholder for ports not yet implemented.
 * This prevents compilation/import errors when generating single artefacts.
 */
export class MockPort {
  // TODO: Define specific port methods
}
`;
}

module.exports = { genMockPort };
