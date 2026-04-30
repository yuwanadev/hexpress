'use strict';

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  gray:   '\x1b[90m',
  blue:   '\x1b[34m',
  dim:    '\x1b[2m',
};

const log = {
  info:    (m) => console.log(`${c.cyan}ℹ${c.reset}  ${m}`),
  success: (m) => console.log(`${c.green}✔${c.reset}  ${m}`),
  warn:    (m) => console.log(`${c.yellow}⚠${c.reset}  ${m}`),
  error:   (m) => console.log(`${c.red}✖${c.reset}  ${m}`),
  dim:     (m) => console.log(`${c.gray}   ${m}${c.reset}`),
  title:   (m) => console.log(`\n${c.bold}${c.blue}${m}${c.reset}\n`),
  file:    (m) => console.log(`${c.green}  +${c.reset} ${c.dim}${m}${c.reset}`),
  blank:   ()  => console.log(''),
};

module.exports = { log, c };
