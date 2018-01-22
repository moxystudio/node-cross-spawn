'use strict';

var path = require('path');
var spawn = require('../../');

spawn('node', [path.resolve(__dirname, 'infinite-wait.js')]);

process.stdin.resume();
