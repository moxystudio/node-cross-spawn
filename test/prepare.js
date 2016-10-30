'use strict';

var glob = require('glob');
var fs = require('fs');
var path = require('path');
var buffered = require('./util/buffered');


// Preare fixtures
var fixturesDir = __dirname + '/fixtures';

glob.sync('prepare_*', { cwd: __dirname + '/fixtures' }).forEach(function (file) {
    var contents = fs.readFileSync(fixturesDir + '/' + file);
    var finalFile = file.replace(/^prepare_/, '').replace(/\.sh$/, '');

    fs.writeFileSync(fixturesDir + '/' + finalFile, contents);
    fs.chmodSync(fixturesDir + '/' + finalFile, parseInt('0777', 8));

    process.stdout.write('Copied "' + file + '" to "' + finalFile + '"\n');
});

// Install spawn-sync for older node versions
if (/^v0\.10\./.test(process.version)) {
    process.stdout.write('Installing spawn-sync..\n');
    buffered('spawn', 'npm', ['install', 'spawn-sync'], { stdio: 'inherit' }, function (err) {
        if (err) {
            throw err;
        }

        process.exit();
    });
}

// Fix AppVeyor tests because Git bin folder is in PATH and it has a "echo" program there
if (process.env.APPVEYOR) {
    process.env.PATH = process.env.PATH
    .split(path.delimiter)
    .filter(function (entry) {
        return !/\\git\\bin$/i.test(path.normalize(entry));
    })
    .join(path.delimiter);
}
