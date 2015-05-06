'use strict';

var spawn = require('../../index');

function buffered(method, command, args, options, callback) {
    var cp;
    var data;
    var results;

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    if (typeof args === 'function') {
        callback = args;
        args = options = null;
    }

    if (method === 'spawnSync') {
        results = spawn.sync(command, args, options);
        callback(results.error, results.stdout.toString(), results.status);
    }
    else {
        cp = spawn(command, args, options);
        data = '';

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
