'use strict';

function genPackageJson(name, type) {
  return JSON.stringify({
    name,
    version: '1.0.0',
    type: 'module',
    description: `Hexagonal Architecture — ${type} — TypeScript`,
    main: 'dist/index.js',
    scripts: {
      build: 'tsc',
      start: 'node dist/index.js',
      dev:   'tsx watch index.ts',
      test:  'jest --config jest.config.ts',
      lint:  'eslint src/',
    },
    dependencies: {
      express: '^4.18.2',
    },
    devDependencies: {
      typescript:            '^5.4.0',
      tsx:                   '^4.7.0',
      '@types/node':         '^20.0.0',
      '@types/express':      '^4.17.21',
      jest:                  '^29.0.0',
      'ts-jest':             '^29.0.0',
      '@types/jest':         '^29.0.0',
      eslint:                '^8.0.0',
      '@typescript-eslint/parser':       '^7.0.0',
      '@typescript-eslint/eslint-plugin': '^7.0.0',
    },
  }, null, 2);
}

module.exports = { genPackageJson };
