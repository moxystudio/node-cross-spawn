'use strict';

const escape = require('./escape');

describe('escape.argument', () => {
    it('should double the whole run of backslashes before a double quote', () => {
        expect(escape.argument('a\\"b')).toBe('^"a\\\\\\^"b^"');
        expect(escape.argument('a\\\\"b')).toBe('^"a\\\\\\\\\\^"b^"');
        expect(escape.argument('a\\\\\\"b')).toBe('^"a\\\\\\\\\\\\\\^"b^"');
    });

    it('should double the whole run of backslashes at the end of the argument', () => {
        expect(escape.argument('a\\')).toBe('^"a\\\\^"');
        expect(escape.argument('a\\\\')).toBe('^"a\\\\\\\\^"');
        expect(escape.argument('a\\\\\\')).toBe('^"a\\\\\\\\\\\\^"');
    });

    it('should leave other backslashes untouched', () => {
        expect(escape.argument('C:\\a\\\\b')).toBe('^"C:\\a\\\\b^"');
    });

    it('should run in linear time on long runs of backslashes', () => {
        const start = Date.now();

        escape.argument(`${'\\'.repeat(200000)}a`);
        escape.argument(`"${'\\'.repeat(200000)}a`);

        expect(Date.now() - start).toBeLessThan(1000);
    });
});
