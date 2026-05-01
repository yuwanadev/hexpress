'use strict';

function genAppResponse() {
  return `/**
 * AppResponse — Typed success response wrapper.
 *
 * Can be used directly or via the res.ApiResponse() middleware helper.
 */
export class AppResponse {
  /**
   * @param {any} data
   * @param {number} statusCode
   */
  constructor(data, statusCode = 200) {
    this.success = true;
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * AppResponseWithMessage — Typed success response with a message.
 *
 * Can be used directly or via the res.AppResponseWithMessage() middleware helper.
 */
export class AppResponseWithMessage {
  /**
   * @param {any} data
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(data, message, statusCode = 200) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
`;
}

module.exports = { genAppResponse };
