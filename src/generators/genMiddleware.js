'use strict';

const { pascal } = require('../utils/names');

function genMiddleware(name) {
  const Name = pascal(name);
  return `/**
 * ${Name}Middleware
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const ${Name}Middleware = (req, res, next) => {
  // TODO: Implement middleware logic
  next();
};
`;
}

module.exports = { genMiddleware };
