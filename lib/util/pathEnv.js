'use strict';

const pathKey = (options = {}) => {
    const environment = options.env || process.env;
    const platform = options.platform || process.platform;

    if (platform !== 'win32') {
        return 'PATH';
    }

    return Object.keys(environment).find((key) => key.toUpperCase() === 'PATH') || 'Path';
};

const pathEnv = (options = null) => {
    const key = pathKey(options);

    if (options === null) {
        return process.env[key];
    }

    return options.env[key];
};

module.exports.pathKey = pathKey;
module.exports.pathEnv = pathEnv;
