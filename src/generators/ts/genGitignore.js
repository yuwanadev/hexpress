'use strict';

function genGitignore() {
  return `node_modules/
.env
dist/
coverage/
*.log
.DS_Store
*.tsbuildinfo
`;
}

module.exports = { genGitignore };
