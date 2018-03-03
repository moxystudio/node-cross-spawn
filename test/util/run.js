'use strict';

const spawn = require('../../index');

function isForceShell(method) {
    return /-force-shell$/.test(method);
}

function isMethodSync(method) {
    return /^sync(-|$)/.test(method);
}

function resolveRun(exitCode, stdout, stderr) {
    stdout = stdout && stdout.toString();
    stderr = stderr && stderr.toString();

    if (exitCode !== 0) {
        return Object.assign(new Error(`Command failed, exited with code #${exitCode}`), {
            exitCode,
            stdout,
            stderr,
        });
    }

    return {
        stdout,
        stderr,
    };
}

function runSync(command, args, options) {
    const { error, status, stdout, stderr } = spawn.sync(command, args, options);

    if (error) {
        throw error;
    }

    const resolved = resolveRun(status, stdout, stderr);

    if (resolved instanceof Error) {
        throw resolved;
    }

    return resolved;
}

function runAsync(command, args, options) {
    const cp = spawn(command, args, options);

    const promise = new Promise((resolve, reject) => {
        let stdout = null;
        let stderr = null;

        cp.stdout && cp.stdout.on('data', (data) => {
            stdout = stdout || new Buffer('');
            stdout = Buffer.concat([stdout, data]);
        });

        cp.stderr && cp.stderr.on('data', (data) => {
            stderr = stderr || new Buffer('');
            stderr = Buffer.concat([stderr, data]);
        });

        const cleanupListeners = () => {
            cp.removeListener('error', onError);
            cp.removeListener('close', onClose);
        };

        const onError = (err) => {
            cleanupListeners();
            reject(err);
        };

        const onClose = (code) => {
            cleanupListeners();

            const resolved = resolveRun(code, stdout, stderr);

            if (resolved instanceof Error) {
                reject(resolved);
            } else {
                resolve(resolved);
            }
        };

        cp
        .on('error', onError)
        .on('close', onClose);
    });

    promise.cp = cp;

    return promise;
}

function run(method, command, args, options) {
    // Are we forcing the shell?
    if (isForceShell(method)) {
        if (args && !Array.isArray(args)) {
            options = args;
            args = null;
        }

        method = method.replace(/-force-shell$/, '');
        options = { forceShell: true, ...options };
    }

    // Run sync version
    return method === 'sync' ?
        runSync(command, args, options) :
        runAsync(command, args, options);
}

module.exports = run;
module.exports.methods = ['spawn-force-shell', 'spawn', 'sync-force-shell', 'sync'];
module.exports.isMethodSync = isMethodSync;
module.exports.isForceShell = isForceShell;
