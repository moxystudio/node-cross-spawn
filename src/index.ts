'use strict';

import * as internalSpawn from './spawn';

if (typeof module !== 'undefined' && 'exports' in module) {
  module.exports = internalSpawn.spawn;
  module.exports.spawn = internalSpawn.spawn;
  module.exports.sync = internalSpawn.spawnSync;
  module.exports.async = internalSpawn.spawnAsync;
  module.exports.spawnSync = internalSpawn.spawnSync;
  module.exports.spawnAsync = internalSpawn.spawnAsync;
  module.exports._parse = internalSpawn._parse;
  module.exports._enoent = internalSpawn._enoent;
}

export const spawn = internalSpawn.spawn;
export const sync = internalSpawn.spawnSync;
export const async = internalSpawn.spawnAsync;
export const spawnSync = internalSpawn.spawnSync;
export const spawnAsync = internalSpawn.spawnAsync;
export const _parse = internalSpawn._parse;
export const _enoent = internalSpawn._enoent;
export default internalSpawn;
