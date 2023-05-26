'use strict';
var fs = require('fs');
var shebangCommand = require('shebang-command');
/**
 * @param command
 */
function readShebang(command) {
    // Read the first 150 bytes from the file
    var size = 150;
    var buffer = Buffer.alloc(size);
    var fd;
    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    }
    catch (e) { /* Empty */ }
    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}
module.exports = readShebang;
