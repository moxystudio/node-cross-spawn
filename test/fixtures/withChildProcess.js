'use strict';

var spawn = require('../../');

spawn('node', [__dirname + '/infinite-wait.js']);

process.stdin.resume();
