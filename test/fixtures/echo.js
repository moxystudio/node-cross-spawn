'use strict';

const args = process.argv.slice(2);

args.forEach((arg, index) => {
    process.stdout.write(arg + (index < args.length - 1 ? '\n' : ''));
});
