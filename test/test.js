'use strict';

var buffered = require('./util/buffered');
var expect = require('expect.js');

describe('cross-spawn', function () {
    it('should support shebang in executables', function (next) {
        buffered(__dirname + '/fixtures/shebang', function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('shebang works!');

            next();
        });
    });

    it('should expand using PATHEXT properly', function (next) {
        buffered(__dirname + '/fixtures/foo', function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data.trim()).to.equal('foo');

            next();
        });
    });

    it('should handle commands with spaces', function (next) {
        buffered(__dirname + '/fixtures/bar space', function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data.trim()).to.equal('bar');

            next();
        });
    });

    it('should handle commands with special shell chars', function (next) {
        buffered(__dirname + '/fixtures/()%!^&|;, ', function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data.trim()).to.equal('special');

            next();
        });
    });

    it('should handle empty arguments', function (next) {
        buffered('node', [
            __dirname + '/fixtures/echo',
            'foo',
            '',
            'bar'
        ], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('foo\n\nbar');

            buffered('echo', [
                'foo',
                '',
                'bar'
            ], function (err, data, code) {
                expect(err).to.not.be.ok();
                expect(code).to.be(0);
                expect(data.trim()).to.equal('foo  bar');

                next();
            });
        });
    });

    it('should handle non-string arguments', function (next) {
        buffered('node', [
            __dirname + '/fixtures/echo',
            1234
        ], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('1234');

            next();
        });
    });

    it('should handle arguments with spaces', function (next) {
        buffered('node', [
            __dirname + '/fixtures/echo',
            'I am',
            'André Cruz'
        ], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('I am\nAndré Cruz');

            next();
        });
    });

    it('should handle arguments with \\"', function (next) {
        buffered('node', [
            __dirname + '/fixtures/echo',
            'foo',
            '\\"',
            'bar'
        ], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('foo\n\\"\nbar');

            next();
        });
    });

    it('should handle arguments that end with \\', function (next) {
        buffered('node', [
            __dirname + '/fixtures/echo',
            'foo',
            'bar\\',
            'baz'
        ], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('foo\nbar\\\nbaz');

            next();
        });
    });

    it('should handle arguments that contain shell special chars', function (next) {
        buffered('node', [
            __dirname + '/fixtures/echo',
            'foo',
            '()',
            'foo',
            '%!',
            'foo',
            '^<',
            'foo',
            '>&',
            'foo',
            '|;',
            'foo',
            ', ',
            'foo'
        ], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data).to.equal('foo\n()\nfoo\n%!\nfoo\n^<\nfoo\n>&\nfoo\n|;\nfoo\n, \nfoo');

            next();
        });
    });

    it('should handle special arguments when using echo', function (next) {
        buffered('echo', ['foo\\"foo\\foo&bar"foo\'bar'], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(0);
            expect(data.trim()).to.equal('foo\\"foo\\foo&bar"foo\'bar');

            buffered('echo', [
                'foo',
                '()',
                'foo',
                '%!',
                'foo',
                '^<',
                'foo',
                '>&',
                'foo',
                '|;',
                'foo',
                ', ',
                'foo'
            ], function (err, data, code) {
                expect(err).to.not.be.ok();
                expect(code).to.be(0);
                expect(data.trim()).to.equal('foo () foo %! foo ^< foo >& foo |; foo ,  foo');

                next();
            });
        });
    });

    it('should give correct exit code', function (next) {
        buffered('node', [ __dirname + '/fixtures/exit'], function (err, data, code) {
            expect(err).to.not.be.ok();
            expect(code).to.be(25);

            next();
        });
    });
});
