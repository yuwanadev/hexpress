'use strict';

function genGitignore() {
  return `node_modules/
.env
dist/
coverage/
*.log
.DS_Store
`;
}

module.exports = { genGitignore };
