var fs = require('fs');
var cp = require('child_process');

var isWin = process.platform === 'win32';

function escapeArg(arg, quote) {
    // Convert to string
    arg = '' + arg;

    // If we are not going to quote the argument,
    // escape shell metacharacters, including double and single quotes:
    if (!quote) {
        arg = arg.replace(/([\(\)%!\^<>&|;,"' ])/g, '^$1');
    } else {
        // Sequence of backslashes followed by a double quote:
        // double up all the backslashes and escape the double quote
        arg = arg.replace(/(\\*)"/gi, '$1$1\\"');

        // Sequence of backslashes followed by the end of the string
        // (which will become a double quote later):
        // double up all the backslashes
        arg = arg.replace(/(\\*)$/, '$1$1');

        // All other backslashes occur literally

        // Quote the whole thing:
        arg = '"' + arg + '"';
    }

    return arg;
}

function escapeCommand(command) {
    // Escape shell metacharacters:
    command = command.replace(/([\(\)%!\^<>&|;, ])/g, '^$1');

    return command;
}

function readShebang(command) {
    var buffer = new Buffer(150);
    var fd;
    var match;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, 150, 0);
    } catch (e) {
        return null;
    }

    match = buffer.toString().trim().match(/\#\!\/usr\/bin\/env ([^\r\n]+)/i);

    return match && match[1];
}

function spawn(command, args, options) {
    var applyQuotes;
    var shebang;

    // Use node's spawn if not on windows
    if (!isWin) {
        return cp.spawn(command, args, options);
    }

    // Escape command & arguments
    applyQuotes = command !== 'echo';  // Do not quote arguments for the special "echo" command
    command = escapeCommand(command);
    args = (args || []).map(function (arg) {
        return escapeArg(arg, applyQuotes);
    });

    // Detect & add support for shebangs in windows
    shebang = readShebang(command);
    if (shebang) {
        args.unshift(command);
        command = shebang;
    }

    // Use cmd.exe
    args = ['/s', '/c', '"' + command + (args.length ? ' ' + args.join(' ') : '') + '"'];
    command = 'cmd';

    // Tell node's spawn that the arguments are already escaped
    options = options || {};
    options.windowsVerbatimArguments = true;

    return cp.spawn(command, args, options);
}

spawn.spawn = spawn;
module.exports = spawn;
