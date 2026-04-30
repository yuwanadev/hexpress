'use strict';

const { pascal } = require('../../utils/names');

function genDomainError(name) {
  const Name = pascal(name).endsWith('Error') ? pascal(name) : `${pascal(name)}Error`;
  const isNotFound = Name.toLowerCase().includes('notfound');
  return `/**
 * ${Name} — Domain Error
 */
export class ${Name} extends Error {
  public readonly statusCode: number;

  constructor(message?: string) {
    super(message ?? '${Name}');
    this.name       = '${Name}';
    this.statusCode = ${isNotFound ? 404 : 400};
  }
}
`;
}

module.exports = { genDomainError };
