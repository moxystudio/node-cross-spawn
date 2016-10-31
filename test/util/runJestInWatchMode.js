'use strict';

var fs = require('fs');
var path = require('path');
var JEST_PATH = 'jest';

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (e) {
        return false;
    }
}

function runJestInWatchMode(spawn, dir) {
    var isRelative = dir[0] !== '/';
    var localPackageJson = path.resolve(dir, 'package.json');
    var args = ['--watchAll'];

    if (isRelative) {
        dir = path.resolve(__dirname, dir);
    }

    if (!fileExists(localPackageJson)) {
        throw new Error('Make sure you have a local package.json file at ' + localPackageJson + '.');
    }

    return spawn(JEST_PATH, args, {
        cwd: dir,
    });
}

module.exports = runJestInWatchMode;
