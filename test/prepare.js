var glob = require('glob');
var fs   = require('fs');

var fixturesDir = __dirname + '/fixtures';

glob.sync('prepare_*', { cwd: __dirname + '/fixtures' }).forEach(function (file) {
    var finalFile = file.replace(/^prepare_/, '').replace(/\.sh$/, '');

    fs.renameSync(fixturesDir + '/' + file, fixturesDir + '/' + finalFile);

    process.stdout.write('Moved "' + file + '" to "' + finalFile + '"\n');
});
