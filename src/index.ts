'use strict';

import * as spawn from './spawn';
export * from './spawn';
export default spawn;

if (typeof module !== 'undefined' && 'exports' in module) {
  module.exports = spawn.default;
  module.exports.spawn = spawn.spawn;
  module.exports.sync = spawn.spawnSync;
  module.exports.async = spawn.spawnAsync;
  module.exports.spawnSync = spawn.spawnSync;
  module.exports.spawnAsync = spawn.spawnAsync;
  module.exports._parse = spawn._parse;
  module.exports._enoent = spawn._enoent;
}
