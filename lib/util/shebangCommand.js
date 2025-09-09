'use strict';

const SHEBANG_RE = /^#!(.*)/;

module.exports = function shebangCommand(string = '') {
  const match = string.match(SHEBANG_RE);

  if (!match) {
    return null;
  }

  const [path, argument] = match[0].replace(/#! ?/, '').split(' ');
  const binary = path.split('/').pop();

  if (binary === 'env') {
    return argument;
  }

  return argument ? `${binary} ${argument}` : binary;
};