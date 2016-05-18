'use strict';

var spawn = require('../../index');

function buffered(method, command, args, options, callback) {
    var cp;
    var stdout;
    var stderr;
    var results;

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    if (typeof args === 'function') {
        callback = args;
        args = options = null;
    }

    if (method === 'sync') {
        results = spawn.sync(command, args, options);
        callback(results.error, results.stdout ? results.stdout.toString() : null, results.status);
    } else {
        cp = spawn(command, args, options);
        stdout = stderr = null;

        cp.stdout && cp.stdout.on('data', function (buffer) {
            stdout = stdout || '';
            stdout += buffer.toString();
        });

        cp.stderr && cp.stderr.on('data', function (buffer) {
            stderr = stderr || '';
            stderr += buffer.toString();
        });

        cp.on('error', callback);

        cp.on('close', function (code) {
            code !== 0 && stderr && console.warn(stderr);
            callback(null, stdout, code);
        });
    }
}

module.exports = buffered;
