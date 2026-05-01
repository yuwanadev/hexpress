'use strict';

const { pascal } = require('../../utils/names');

function genMiddleware(name) {
  const Name = pascal(name);
  return `import { Request, Response, NextFunction } from 'express';

/**
 * ${Name}Middleware
 * 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const ${Name}Middleware = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement middleware logic
  next();
};
`;
}

module.exports = { genMiddleware };
