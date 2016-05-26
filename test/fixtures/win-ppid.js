#!/usr/bin/env node

var spawnSync = require('child_process').spawnSync || require('spawn-sync');

function ppidSync() {
    var res = spawnSync('wmic',
        ['process', 'where', '(processid=' + process.pid + ')', 'get', 'parentprocessid']);
    var lines = res.stdout.toString().split(/\r?\n/);
    return parseInt(lines[1].trim(), 10);
}

console.log(ppidSync());
