'use strict';

function genPackageJson(name, type) {
  return JSON.stringify({
    name,
    version: '1.0.0',
    type: 'module',
    description: `Hexagonal Architecture — ${type}`,
    main: 'index.js',
    scripts: {
      start: 'node index.js',
      dev:   'node --watch index.js',
      test:  'node --experimental-vm-modules node_modules/.bin/jest',
      lint:  'eslint src/',
    },
    dependencies: {
      express: '^4.18.2',
    },
    devDependencies: {
      jest:   '^29.0.0',
      eslint: '^8.0.0',
    },
  }, null, 2);
}

module.exports = { genPackageJson };
