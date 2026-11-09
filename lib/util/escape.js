'use strict';

// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
}

function escapeArgument(arg, doubleEscapeMetaChars) {
    // Convert to string
    arg = `${arg}`;

    // Algorithm below is based on https://qntm.org/cmd
    // It's slightly altered to disable JS backtracking to avoid hanging on specially crafted input
    // Please see https://github.com/moxystudio/node-cross-spawn/pull/160 for more information

    // Sequence of backslashes followed by a double quote:
    // double up all the backslashes and escape the double quote.
    // Sequence of backslashes followed by the end of the string
    // (which will become a double quote later):
    // double up all the backslashes.
    // All other backslashes occur literally.
    // Whole runs of backslashes are matched first so that the engine never
    // rescans a run, which keeps this linear on any input.
    arg = arg.replace(/(\\*)(?:(")|($))|\\+/g, (match, backslashes, quote, end) => {
        if (quote === undefined && end === undefined) {
            return match;
        }

        return backslashes + backslashes + (quote ? '\\"' : '');
    });

    // Quote the whole thing:
    arg = `"${arg}"`;

    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    // Double escape meta chars if necessary
    if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, '^$1');
    }

    return arg;
}

module.exports.command = escapeCommand;
module.exports.argument = escapeArgument;
