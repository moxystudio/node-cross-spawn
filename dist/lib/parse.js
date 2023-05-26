'use strict';
var path = require('path');
var resolveCommand = require('./util/resolveCommand');
var escape = require('./util/escape');
var readShebang = require('./util/readShebang');
var isWin = process.platform === 'win32';
var isExecutableRegExp = /\.(?:com|exe)$/i;
var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
/**
 * @param parsed
 */
function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);
    var shebang = parsed.file && readShebang(parsed.file);
    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
    }
    return parsed.file;
}
/**
 * @param parsed
 */
function parseNonShell(parsed) {
    if (!isWin) {
        return parsed;
    }
    // Detect & add support for shebangs
    var commandFile = detectShebang(parsed);
    // We don't need a shell if the command filename is an executable
    var needsShell = !isExecutableRegExp.test(commandFile);
    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        var needsDoubleEscapeMetaChars_1 = isCmdShimRegExp.test(commandFile);
        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path.normalize(parsed.command);
        // Escape command & arguments
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map(function (arg) { return escape.argument(arg, needsDoubleEscapeMetaChars_1); });
        var shellCommand = [parsed.command].concat(parsed.args).join(' ');
        parsed.args = ['/d', '/s', '/c', "\"".concat(shellCommand, "\"")];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }
    return parsed;
}
/**
 * @param command
 * @param args
 * @param options
 */
function parse(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }
    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original
    // Build our parsed object
    var parsed = {
        command: command,
        args: args,
        options: options,
        file: undefined,
        original: {
            command: command,
            args: args,
        },
    };
    // Delegate further parsing to shell or non-shell
    return options.shell ? parsed : parseNonShell(parsed);
}
module.exports = parse;
