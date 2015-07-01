'use strict';

var sync       = require('spawn-sync');
var crossSpawn = require('cross-spawn-async');

function spawnSync(command, args, options) {
    var parsed = crossSpawn.parse(command, args, options);

    return sync.apply(null, parsed);
}

module.exports = crossSpawn.spawn;
module.exports.spawn = crossSpawn.spawn;
module.exports.spawnSync = spawnSync;
module.exports.parse = crossSpawn.parse;
