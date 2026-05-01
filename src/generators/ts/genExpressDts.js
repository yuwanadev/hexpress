'use strict';

function genExpressDts() {
  return `import { AppResponse, AppResponseWithMessage } from './shared/infrastructure/http/AppResponse';

declare global {
  namespace Express {
    interface Response {
      ApiResponse: <T>(data: T, statusCode?: number) => void;
      ApiResponseWithMessage: <T>(data: T, message: string, statusCode?: number) => void;
    }
  }
}

export {};
`;
}

module.exports = { genExpressDts };
