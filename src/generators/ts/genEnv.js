'use strict';

function genEnv(port = 3000, type = 'modular-monolith') {
  const base = `NODE_ENV=development\nPORT=${port}\nDATABASE_URL=postgres://localhost/mydb\nLOG_LEVEL=info\n`;
  if (type === 'microservice') {
    return base + `\nKAFKA_BROKERS=localhost:9092\nKAFKA_CLIENT_ID=${port}\n`;
  }
  return base;
}

module.exports = { genEnv };
