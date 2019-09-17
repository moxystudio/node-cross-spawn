'use strict';

const fs = require('fs');

function parseShebangCommand(string = '') {
    const match = string.match(/^#!(.*)/);

    if (!match) {
        return null;
    }

    const [path, argument] = match[0].replace(/#! ?/, '').split(' ');
    const binary = path.split('/').pop();

    if (binary === 'env') {
        return argument;
    }

    return argument ? `${binary} ${argument}` : binary;
}

function readShebang(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    const buffer = Buffer.alloc(size);

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    } catch (e) {
        /* Empty */
    }

    // Attempt to extract shebang (null is returned if not a shebang)
    return parseShebangCommand(buffer.toString());
}

module.exports = readShebang;
