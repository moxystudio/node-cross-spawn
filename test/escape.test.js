'use strict';

const escape = require('../lib/util/escape');

describe('escape.argument', () => {
    it('should strip CR and LF so they cannot act as cmd.exe command separators', () => {
        expect(escape.argument('innocent\r\necho PWNED')).toBe(escape.argument('innocentecho PWNED'));
        expect(escape.argument('a\nb\rc')).toBe(escape.argument('abc'));
        expect(escape.argument('safe')).toBe(escape.argument('safe'));
    });

    it('should still escape shell meta characters after stripping newlines', () => {
        expect(escape.argument('a&b\nc')).toBe(escape.argument('a&bc'));
    });

    it('should not leave raw CR or LF in the escaped output', () => {
        const escaped = escape.argument('foo\r\nbar');
        expect(escaped).not.toMatch(/[\r\n]/);
    });
});

describe('escape.command', () => {
    it('should strip CR and LF from the command string', () => {
        expect(escape.command('echo\r\nwhoami')).toBe(escape.command('echowhoami'));
        expect(escape.command('echo\r\nwhoami')).not.toMatch(/[\r\n]/);
    });
});
