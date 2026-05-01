'use strict';

function genPackageJson(name, type) {
  return JSON.stringify({
    name,
    version: '1.0.0',
    type: 'module',
    description: `Hexagonal Architecture — ${type} — TypeScript`,
    "main": "dist/index",
    "scripts": {
      "build": "tsc",
      "start": "node dist/index",
      "dev": "tsx watch index.ts",
      "test": "jest --config jest.config.ts",
      "lint": "eslint src/"
    },
    "dependencies": {
      "cors": "^2.8.6",
      "dotenv": "^16.4.0",
      "express": "^4.18.2",
      "helmet": "^7.1.0",
      "pg": "^8.13.0"
    },
    "devDependencies": {
      "@types/cors": "^2.8.19",
      "@types/express": "^4.17.21",
      "@types/jest": "^29.0.0",
      "@types/node": "^20.0.0",
      "@types/pg": "^8.11.0",
      "@typescript-eslint/eslint-plugin": "^7.0.0",
      "@typescript-eslint/parser": "^7.0.0",
      "eslint": "^8.0.0",
      "jest": "^29.0.0",
      "ts-jest": "^29.0.0",
      "tsx": "^4.7.0",
      "typescript": "^5.4.0"
    }
  }, null, 2);
}

module.exports = { genPackageJson };
