'use strict';

function genSharedErrorHandler() {
  return `import type { Request, Response, NextFunction } from 'express';

interface DomainError extends Error {
  statusCode?: number;
}

/**
 * errorHandler — Express error middleware.
 * Maps domain errors (with statusCode) to HTTP responses.
 */
export function errorHandler(err: DomainError, req: Request, res: Response, next: NextFunction): void {
  const status  = err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Internal Server Error';
  if (status >= 500) console.error('[ERROR]', err);
  res.status(status).json({ error: { name: err.name, message } });
}
`;
}

module.exports = { genSharedErrorHandler };
