'use strict';

function genSharedErrorHandler() {
  return `import type { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';

/**
 * errorHandler — Express error middleware.
 * Catches AppError instances and returns a consistent JSON response.
 * Unknown errors are logged and returned as 500.
 */
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
`;
}

module.exports = { genSharedErrorHandler };
