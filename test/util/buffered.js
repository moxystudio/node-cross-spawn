'use strict';

var spawn = require('../../index');

function buffered(method, command, args, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    if (typeof args === 'function') {
        callback = args;
        args = options = null;
    }

    if (method === 'sync') {
        var results = spawn.sync(command, args, options);
        callback(results.error, results.stdout.toString(), results.status);
    }
    else {
        var cp = spawn(command, args, options);
        var data = '';

        cp.stdout.on('data', function(buffer) {
            data += buffer.toString();
        });

        cp.on('error', callback);

        cp.on('close', function(code) {
            callback(null, data, code);
        });
    }
}

module.exports = buffered;
