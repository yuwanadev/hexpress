'use strict';

function genResponseHandler() {
  return `import type { Request, Response, NextFunction } from 'express';
import { AppResponse, AppResponseWithMessage } from './AppResponse';

/**
 * responseHandler — Express middleware
 *
 * Attaches convenience helpers to \`res\` for consistent API responses.
 * Must be registered BEFORE route handlers.
 *
 * Usage:
 *   res.ApiResponse(data);
 *   res.ApiResponse(data, 201);
 *   res.ApiResponseWithMessage(data, 'Created successfully', 201);
 */
export const responseHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.ApiResponse = <T>(data: T, statusCode = 200) => {
    const response = new AppResponse(data, statusCode);
    res.status(statusCode).json(response);
  };

  res.ApiResponseWithMessage = <T>(data: T, message: string, statusCode = 200) => {
    const response = new AppResponseWithMessage(data, message, statusCode);
    res.status(statusCode).json(response);
  };

  next();
};
`;
}

module.exports = { genResponseHandler };
