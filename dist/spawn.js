"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = exports.async = exports._parse = exports._enoent = exports.spawnAsync = exports.spawnSync = exports.spawn = void 0;
var child_process_1 = __importDefault(require("child_process"));
var enoent_1 = __importDefault(require("./lib/enoent"));
var parse_1 = __importDefault(require("./lib/parse"));
/**
 * @description
 * @param command - Command.
 * @param  args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
function spawn(command, args, options) {
    // Parse the arguments
    var parsed = (0, parse_1.default)(command, args, options);
    // Spawn the child process
    var spawned = child_process_1.default.spawn(parsed.command, parsed.args, parsed.options);
    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent_1.default.hookChildProcess(spawned, parsed);
    return spawned;
}
exports.spawn = spawn;
/**
 * @description
 * @param command - Command.
 * @param args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
function spawnSync(command, args, options) {
    // Parse the arguments
    var parsed = (0, parse_1.default)(command, args, options);
    // Spawn the child process
    var result = child_process_1.default.spawnSync(parsed.command, parsed.args, parsed.options);
    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent_1.default.verifyENOENTSync(result.status, parsed);
    return result;
}
exports.spawnSync = spawnSync;
/**
 * Spawn asynchronously.
 * @description
 * @param command - Command.
 * @param args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
function spawnAsync(command, args, options) {
    return new Promise(function (resolve) {
        var stdout = '';
        var stderr = '';
        var child = spawn(command, args, options);
        // Capture stdout
        if (child.stdout && 'on' in child.stdout) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function (data) {
                stdout += data;
            });
        }
        // Capture stderr
        if (child.stderr && 'on' in child.stdout) {
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function (data) {
                stderr += data;
            });
        }
        child.on('close', function (code, signal) {
            // Should probably be 'exit', not 'close'
            /* if (code !== 0) {
                      console.log('[ERROR]', command, ...args, 'dies with code', code, 'signal', signal);
                  }*/
            // Process completed
            resolve({
                stdout: stdout,
                stderr: stderr,
                error: code !== 0 ? __spreadArray(__spreadArray([command], args, true), ['dies with code', code, 'signal', signal], false).join(' ') : null,
                output: "".concat(stdout, "\n\n").concat(stderr)
            });
        });
        /*
            child.on('error', function (err) {
                // Process creation failed
                resolve(err);
            });*/
    });
}
exports.spawnAsync = spawnAsync;
exports.default = spawn;
exports._enoent = enoent_1.default;
exports._parse = parse_1.default;
exports.async = spawnAsync;
exports.sync = spawnSync;
