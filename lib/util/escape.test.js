'use strict';

const escape = require('./escape');

// Expected values follow the cmd.exe escaping rules documented at
// https://qntm.org/cmd and the meta-char list in
// http://www.robvanderwoude.com/escapechars.php

describe('escape.command', () => {
    it('should escape meta chars with a caret', () => {
        expect(escape.command('foo bar')).toBe('foo^ bar');
        expect(escape.command('a&b|c<d>e')).toBe('a^&b^|c^<d^>e');
        expect(escape.command('(x)')).toBe('^(x^)');
        expect(escape.command('100%')).toBe('100^%');
    });

    it('should not add surrounding quotes', () => {
        expect(escape.command('foo')).toBe('foo');
    });
});

describe('escape.argument', () => {
    it('should wrap the argument in double quotes and escape meta chars', () => {
        expect(escape.argument('foo')).toBe('^"foo^"');
        expect(escape.argument('foo bar')).toBe('^"foo^ bar^"');
        expect(escape.argument('%PATH%')).toBe('^"^%PATH^%^"');
        expect(escape.argument('a&b|c<d>e')).toBe('^"a^&b^|c^<d^>e^"');
        expect(escape.argument('(x)')).toBe('^"^(x^)^"');
        expect(escape.argument('a,b;c')).toBe('^"a^,b^;c^"');
    });

    it('should escape a double quote preceded by no backslashes', () => {
        expect(escape.argument('a"b')).toBe('^"a\\^"b^"');
    });

    it('should double backslashes that precede a double quote', () => {
        // Two literal backslashes before the quote become four
        expect(escape.argument('a\\\\"b')).toBe('^"a\\\\\\\\^"b^"');
    });

    it('should extend a run of trailing backslashes (current behavior: n become n + 1)', () => {
        // Regression coverage for the existing implementation, which was
        // deliberately altered in https://github.com/moxystudio/node-cross-spawn/pull/160
        const bs = '\\';

        expect(escape.argument(`abc${bs.repeat(2)}`)).toBe(`^"abc${bs.repeat(3)}^"`);
        expect(escape.argument(`abc${bs}`)).toBe(`^"abc${bs.repeat(2)}^"`);
    });

    it('should convert non-string input to string', () => {
        expect(escape.argument(42)).toBe('^"42^"');
    });

    it('should double escape meta chars when doubleEscapeMetaChars is set', () => {
        expect(escape.argument('a&b', true)).toBe('^^^"a^^^&b^^^"');
    });
});
