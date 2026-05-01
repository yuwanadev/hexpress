'use strict';

function genAppError() {
  return `/**
 * AppError — Shared application error.
 *
 * Throw this from use-cases, repositories, or anywhere you need
 * a typed error with an HTTP status code. The global errorHandler
 * middleware catches it and returns a consistent JSON response.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Validation failed', 400);
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
`;
}

module.exports = { genAppError };
