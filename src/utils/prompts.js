'use strict';

const readline = require('readline');
const { log } = require('./logger');

/**
 * Prompt for user input.
 * 
 * @param {string} question 
 * @param {function} validate - returns the value if valid, null otherwise
 * @returns {Promise<string>}
 */
function prompt(question, validate) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = () => {
      rl.question(question, (ans) => {
        const result = validate(ans.trim());
        if (result !== null) {
          rl.close();
          resolve(result);
        } else {
          log.warn('Invalid option. Try again.');
          ask();
        }
      });
    };
    ask();
  });
}

/**
 * Prompt for a boolean (yes/no) answer.
 * 
 * @param {string} question 
 * @param {boolean} defaultAnswer 
 * @returns {Promise<boolean>}
 */
async function confirm(question, defaultAnswer = true) {
  const suffix = defaultAnswer ? '[Y/n]' : '[y/N]';
  const result = await prompt(`${question} ${suffix}\n> `, (ans) => {
    if (ans === '') return defaultAnswer;
    if (ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes') return true;
    if (ans.toLowerCase() === 'n' || ans.toLowerCase() === 'no') return false;
    return null;
  });
  return result;
}

module.exports = { prompt, confirm };
