'use strict';

const path = require('path');
const which = require('which');
const pathKey = require('path-key')();

function resolveCommandAttempt(parsed, withPathExt) {
    withPathExt = !!withPathExt;

    try {
        return which.sync(parsed.command, {
            path: (parsed.options.env || process.env)[pathKey],
            pathExt: withPathExt && process.env.PATHEXT ? path.delimiter + process.env.PATHEXT : undefined,
        });
    } catch (e) { /* Empty */ }
}

function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
}

module.exports = resolveCommand;
