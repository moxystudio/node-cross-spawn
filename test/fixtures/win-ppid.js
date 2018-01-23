#!/usr/bin/env node

'use strict';

const spawnSync = require('child_process').spawnSync;

function ppidSync() {
    const res = spawnSync('wmic',
        ['process', 'where', `(processid=${process.pid})`, 'get', 'parentprocessid']);
    const lines = res.stdout.toString().split(/\r?\n/);

    return parseInt(lines[1].trim(), 10);
}

console.log(ppidSync());
