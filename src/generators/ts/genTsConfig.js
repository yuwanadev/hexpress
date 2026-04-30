'use strict';

function genTsConfig() {
  return JSON.stringify({
    compilerOptions: {
      target:          'ES2022',
      module:          'NodeNext',
      moduleResolution: 'NodeNext',
      lib:             ['ES2022'],
      outDir:          './dist',
      rootDir:         '.',
      strict:          true,
      esModuleInterop: true,
      skipLibCheck:    true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule:               true,
      declaration:                     true,
      declarationMap:                  true,
      sourceMap:                       true,
      noUnusedLocals:                  true,
      noUnusedParameters:              true,
      noFallthroughCasesInSwitch:      true,
      noImplicitReturns:               true,
    },
    include: ['src/**/*.ts', 'index.ts'],
    exclude: ['node_modules', 'dist', 'tests'],
  }, null, 2);
}

module.exports = { genTsConfig };
