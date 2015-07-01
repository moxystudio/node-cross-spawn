var glob = require('glob');
var fs   = require('fs');

var fixturesDir = __dirname + '/fixtures';

glob.sync('prepare_*', { cwd: __dirname + '/fixtures' }).forEach(function (file) {
    var contents = fs.readFileSync(fixturesDir + '/' + file);
    var finalFile = file.replace(/^prepare_/, '').replace(/\.sh$/, '');

    fs.writeFileSync(fixturesDir + '/' + finalFile, contents);
    fs.chmodSync(fixturesDir + '/' + finalFile, 0777);

    process.stdout.write('Copied "' + file + '" to "' + finalFile + '"\n');
});
