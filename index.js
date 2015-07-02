'use strict';

var sync       = require('spawn-sync');
var crossSpawn = require('cross-spawn-async');
var parse      = require('cross-spawn-async/lib/parse');
var enoent     = require('cross-spawn-async/lib/enoent');

function spawn(command, args, options) {
    return crossSpawn.spawn(command, args, options);
}

function spawnSync(command, args, options) {
    var parsed;
    var result;
    var err;

    // Parse the arguments
    parsed = parse(command, args, options);

    // Spawn the child process
    result = sync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    err = enoent.verifyENOENT(result.status, parsed, 'spawnSync');

    if (err) {
        result.error = err;
    }

    return result;
}

module.exports       = spawn;
module.exports.spawn = spawn;
module.exports.sync  = spawnSync;
