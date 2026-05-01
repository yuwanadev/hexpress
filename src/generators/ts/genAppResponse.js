'use strict';

function genAppResponse() {
  return `/**
 * AppResponse — Typed success response wrapper.
 *
 * Can be used directly or via the res.ApiResponse() middleware helper.
 */
export class AppResponse<T> {
  public readonly success = true;
  public readonly statusCode: number;
  public readonly data: T;

  constructor(data: T, statusCode = 200) {
    this.data = data;
    this.statusCode = statusCode;
  }
}

/**
 * AppResponseWithMessage — Typed success response with a message.
 *
 * Can be used directly or via the res.AppResponseWithMessage() middleware helper.
 */
export class AppResponseWithMessage<T> {
  public readonly success = true;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;

  constructor(data: T, message: string, statusCode = 200) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}
`;
}

module.exports = { genAppResponse };
