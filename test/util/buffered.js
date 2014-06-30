'use strict';

var spawn = require('../../index');

function buffered(command, args, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    if (typeof args === 'function') {
        callback = args;
        args = options = null;
    }

    var cp = spawn(command, args, options);
    var data = '';

    cp.stdout.on('data', function (buffer) {
        data += buffer.toString();
    });

    cp.on('error', callback);

    cp.on('close', function (code) {
        callback(null, data, code);
    });
}

module.exports = buffered;
