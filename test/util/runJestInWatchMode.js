'use strict';

var fs = require('fs');
var path = require('path');
var JEST_PATH = 'jest';

function fileExists(filePath) {
    var F_OK = fs.constants && fs.constants.F_OK || fs.F_OK;

    try {
        fs.accessSync(filePath, F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function runJestInWatchMode(spawn, dir, args) {
    var isRelative = dir[0] !== '/';
    var localPackageJson = path.resolve(dir, 'package.json');
    var childProcess;
    var getStderrAsync;

    if (isRelative) {
        dir = path.resolve(__dirname, dir);
    }


    if (!fileExists(localPackageJson)) {
        throw new Error('Make sure you have a local package.json file at ' + localPackageJson + '.');
    }
    args = (args !== undefined) ? args : [];
    args.push('--watchAll');

    childProcess = spawn(JEST_PATH, args, {
        cwd: dir,
    });
    getStderrAsync = function () {
        return new Promise(function (resolve) {
            var stderr = '';

            childProcess.stderr.on('data', function (data) {
                stderr += data.toString();
                if (data.toString().includes('Ran all')) {
                    resolve(stderr);
                    childProcess.stderr.removeAllListeners('data');
                }
            });
        });
    };

    return { childProcess: childProcess, getStderrAsync: getStderrAsync };
}

module.exports = runJestInWatchMode;
