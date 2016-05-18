'use strict';

var glob = require('glob');
var fs = require('fs');
var crossSpawn = require('../');

var fixturesDir = __dirname + '/fixtures';

glob.sync('prepare_*', { cwd: __dirname + '/fixtures' }).forEach(function (file) {
    var contents = fs.readFileSync(fixturesDir + '/' + file);
    var finalFile = file.replace(/^prepare_/, '').replace(/\.sh$/, '');

    fs.writeFileSync(fixturesDir + '/' + finalFile, contents);
    fs.chmodSync(fixturesDir + '/' + finalFile, parseInt('0777', 8));

    process.stdout.write('Copied "' + file + '" to "' + finalFile + '"\n');
});

if (/^v0\.10\./.test(process.version)) {
    process.stdout.write('Installing spawn-sync..\n');
    crossSpawn.sync('npm', ['install', 'spawn-sync'], { stdio: 'inherit' });
}
