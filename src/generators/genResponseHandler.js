'use strict';

function genResponseHandler() {
  return `import { AppResponse, AppResponseWithMessage } from './AppResponse.js';

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
export const responseHandler = (req, res, next) => {
  /**
   * @param {any} data
   * @param {number} statusCode
   */
  res.ApiResponse = (data, statusCode = 200) => {
    const response = new AppResponse(data, statusCode);
    res.status(statusCode).json(response);
  };

  /**
   * @param {any} data
   * @param {string} message
   * @param {number} statusCode
   */
  res.ApiResponseWithMessage = (data, message, statusCode = 200) => {
    const response = new AppResponseWithMessage(data, message, statusCode);
    res.status(statusCode).json(response);
  };

  next();
};
`;
}

module.exports = { genResponseHandler };
