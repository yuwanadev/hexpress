'use strict';

function genSharedErrorHandler() {
  return `/**
 * errorHandler — Express error middleware.
 * Maps domain errors (with statusCode) to HTTP responses.
 */
export function errorHandler(err, req, res, next) {
  const status  = err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Internal Server Error';
  if (status >= 500) console.error('[ERROR]', err);
  res.status(status).json({ error: { name: err.name, message } });
}
`;
}

module.exports = { genSharedErrorHandler };
