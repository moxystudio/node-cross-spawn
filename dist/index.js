'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._enoent = exports._parse = exports.spawnAsync = exports.spawnSync = exports.async = exports.sync = exports.spawn = void 0;
var internalSpawn = __importStar(require("./spawn"));
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
exports.spawn = internalSpawn.spawn;
exports.sync = internalSpawn.spawnSync;
exports.async = internalSpawn.spawnAsync;
exports.spawnSync = internalSpawn.spawnSync;
exports.spawnAsync = internalSpawn.spawnAsync;
exports._parse = internalSpawn._parse;
exports._enoent = internalSpawn._enoent;
exports.default = internalSpawn;
