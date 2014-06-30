var cp = require('child_process');

var isWin = process.platform === 'win32';

function escapeArg(arg) {
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

    // Escape shell metacharacters:
    //arg = arg.replace(/([\(\)%!\^<>&|;, ])/g, '^$1');

    return arg;
}

function escapeCommand(command) {
    // Escape shell metacharacters:
    command = command.replace(/([\(\)%!\^<>&|;, ])/g, '^$1');

    return command;
}

function spawn(command, args, options) {
    // Use node's spawn if not on windows
    if (!isWin) {
        return cp.spawn(command, args, options);
    }

    // Escape command & arguments
    command = escapeCommand(command);
    args = (args || []).map(escapeArg);

    // Use cmd.exe
    args = ['/c', '"' + command + (args.length ? ' ' + args.join(' ') : '') + '"'];
    command = 'cmd';

    // Tell node's spawn that the arguments are already escaped
    options = options || {};
    options.windowsVerbatimArguments = true;

    return cp.spawn(command, args, options);
}

module.exports = spawn;
