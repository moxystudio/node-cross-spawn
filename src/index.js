'use strict';

// import * as spawner from './spawn';
// export * from './spawn';
// export default spawner

const spawn = require('./spawn')
module.exports = spawn.default;
module.exports.spawn = spawn.spawn;
module.exports.sync = spawn.spawnSync;
module.exports.async = spawn.spawnAsync;
module.exports.spawnSync = spawn.spawnSync;
module.exports.spawnAsync = spawn.spawnAsync;
module.exports._parse = spawn._parse;
module.exports._enoent = spawn._enoent;
