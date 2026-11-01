'use strict';

const fs = require('fs');
const shebangCommand = require('shebang-command');

function readShebang(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    const buffer = Buffer.alloc(size);

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
    } catch (e) { /* Empty */ } finally {
        // Always close the file descriptor, even if reading failed
        if (fd !== undefined) {
            try {
                fs.closeSync(fd);
            } catch (e) { /* Empty */ }
        }
    }

    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}

module.exports = readShebang;
