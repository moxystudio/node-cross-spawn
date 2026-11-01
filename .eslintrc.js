'use strict';

// Unit tests in `lib/` must get the same config as `test/.eslintrc`, but ESLint 5 doesn't support
// `extends` in `overrides`, so we apply what `es9` adds on top of `es6` manually
const es7 = require('eslint-config-moxy/es7');
const es8 = require('eslint-config-moxy/es8');
const es9 = require('eslint-config-moxy/es9');

module.exports = {
    root: true,
    extends: [
        'eslint-config-moxy/es6',
        'eslint-config-moxy/addons/node',
        // Only enabled for test files, such as `lib/**/*.test.js`
        'eslint-config-moxy/addons/jest',
    ],
    overrides: [
        {
            files: ['lib/**/*.test.js'],
            parserOptions: es9.parserOptions,
            rules: Object.assign({}, es7.rules, es8.rules, es9.rules),
        },
    ],
};
