'use strict';

const cp = require('child_process');
const parse = require('./lib/parse');
const enoent = require('./lib/enoent');

function spawn(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

/**
 * Spawn asynchronously.
 *
 * @description
 * @param {string} command - Command.
 * @param {string[]} args - Arguments.
 * @param {import('child_process').SpawnOptions} options - Spawn Options.
 * @returns {Promise<{ stdout: string, stderr: string, err: string | null }>} Return Promise.
 */
function spawnAsync(command, args, options) {
    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        const child = spawn(command, args, options);

        // Capture stdout
        if (child.stdout && 'on' in child.stdout) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (data) => {
                stdout += data;
            });
        }

        // Capture stderr
        if (child.stderr && 'on' in child.stdout) {
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', (data) => {
                stderr += data;
            });
        }

        child.on('close', (code, signal) => {
            // Should probably be 'exit', not 'close'
            /* if (code !== 0) {
                console.log('[ERROR]', command, ...args, 'dies with code', code, 'signal', signal);
            }*/
            // Process completed
            resolve({
                stdout,
                stderr,
                err: code !== 0 ? [command, ...args, 'dies with code', code, 'signal', signal].join(' ') : null,
            });
        });

        /*
        child.on('error', function (err) {
            // Process creation failed
            resolve(err);
        });*/
    });
}

module.exports = spawn;
module.exports.spawn = spawn;
module.exports.sync = spawnSync;
module.exports.async = spawnAsync;

module.exports._parse = parse;
module.exports._enoent = enoent;
