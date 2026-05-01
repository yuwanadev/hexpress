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
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
`;
}

module.exports = { genAppError };
