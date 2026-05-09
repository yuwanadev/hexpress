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
      cors:    '^2.8.5',
      helmet:  '^7.1.0',
      pg:      '^8.13.0',
      dotenv:  '^16.4.0',
      redis:   '^4.7.0',
      '@opentelemetry/sdk-node':                   '^0.52.0',
      '@opentelemetry/sdk-trace-node':             '^1.25.0',
      '@opentelemetry/exporter-trace-otlp-http':   '^0.52.0',
      '@opentelemetry/resources':                  '^1.25.0',
      '@opentelemetry/semantic-conventions':       '^1.25.0',
      '@opentelemetry/api':                        '^1.9.0',
    },
    devDependencies: {
      jest:   '^29.0.0',
      eslint: '^8.0.0',
    },
  }, null, 2);
}

module.exports = { genPackageJson };
