'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('expect.js');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var assign = require('lodash.assign');
var hasEmptyArgumentBug = require('../lib/util/hasEmptyArgumentBug');
var spawn = require('../');
var buffered = require('./util/buffered');

var isWin = process.platform === 'win32';

describe('cross-spawn', function () {
    var methods = ['spawn', 'sync'];

    methods.forEach(function (method) {
        describe(method, function () {
            var originalPath = process.env.PATH;

            before(function () {
                mkdirp.sync(__dirname + '/tmp');
            });

            after(function (next) {
                // Give it some time, RIMRAF was giving problems on windows
                this.timeout(10000);

                rimraf(__dirname + '/tmp', function () {
                    // Ignore errors, RIMRAF was giving problems on windows
                    next(null);
                });
            });

            afterEach(function () {
                process.env.PATH = originalPath;
            });

            it('should support shebang in executables with /usr/bin/env', function (next) {
                buffered(method, __dirname + '/fixtures/shebang', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang works!');

                    // Test if the actual shebang file is resolved against the PATH
                    process.env.PATH = path.normalize(__dirname + '/fixtures/') + path.delimiter + process.env.PATH;

                    buffered(method, 'shebang', function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data).to.equal('shebang works!');

                        next();
                    });
                });
            });

            it('should support shebang in executables with relative path', function (next) {
                var executable = './' + path.relative(process.cwd(), __dirname + '/fixtures/shebang');

                fs.writeFileSync(__dirname + '/tmp/shebang', '#!/usr/bin/env node\n\nprocess.stdout.write(\'yeah\');',
                    { mode: parseInt('0777', 8) });
                process.env.PATH = path.normalize(__dirname + '/tmp/') + path.delimiter + process.env.PATH;

                buffered(method, executable, function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang works!');

                    next();
                });
            });

            it('should support shebang in executables with relative path that starts with `..`', function (next) {
                var executable = '../' + path.basename(process.cwd()) + '/' + path.relative(process.cwd(), __dirname + '/fixtures/shebang');

                fs.writeFileSync(__dirname + '/tmp/shebang', '#!/usr/bin/env node\n\nprocess.stdout.write(\'yeah\');',
                    { mode: parseInt('0777', 8) });
                process.env.PATH = path.normalize(__dirname + '/tmp/') + path.delimiter + process.env.PATH;

                buffered(method, executable, function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang works!');

                    next();
                });
            });

            it('should support shebang in executables with extensions', function (next) {
                fs.writeFileSync(__dirname + '/tmp/shebang_' + method + '.js', '#!/usr/bin/env node\n\nprocess.stdout.write(\'shebang with \
extension\');', { mode: parseInt('0777', 8) });
                process.env.PATH = path.normalize(__dirname + '/tmp/') + path.delimiter + process.env.PATH;

                buffered(method, __dirname + '/tmp/shebang_' + method + '.js', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('shebang with extension');

                    // Test if the actual shebang file is resolved against the PATH
                    process.env.PATH = path.normalize(__dirname + '/fixtures/') + path.delimiter + process.env.PATH;

                    buffered(method, 'shebang_' + method + '.js', function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data).to.equal('shebang with extension');

                        next();
                    });
                });
            });

            it('should expand using PATHEXT properly', function (next) {
                buffered(method, __dirname + '/fixtures/foo', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('foo');

                    next();
                });
            });

            it('should handle commands with spaces', function (next) {
                buffered(method, __dirname + '/fixtures/bar space', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('bar');

                    next();
                });
            });

            it('should handle commands with special shell chars', function (next) {
                buffered(method, __dirname + '/fixtures/()%!^&;, ', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('special');

                    next();
                });
            });

            it('should handle commands with names of environment variables', function (next) {
                buffered(method, __dirname + '/fixtures/%CD%', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('special');

                    next();
                });
            });

            describe('should preserve environment variables', function () {
                before(function () {
                    process.env.FOO = 'foovalue';
                });

                it('when env dictionary is omitted', function (next) {
                    buffered(method, __dirname + '/fixtures/echoEnv', function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('foovalue');

                        next();
                    });
                });

                it('when env dictionary is passed', function (next) {
                    buffered(method, __dirname + '/fixtures/echoEnv', {
                        env: {
                            BAR: 'barvalue',
                        },
                    }, function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('barvalue');

                        next();
                    });
                });

                after(function () {
                    delete process.env.FOO;
                });
            });

            it('should handle arguments with quotes', function (next) {
                buffered(method, 'node', [
                    __dirname + '/fixtures/echo',
                    '"foo"',
                    'foo"bar"foo',
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('"foo"\nfoo"bar"foo');

                    next();
                });
            });

            it('should handle empty arguments', function (next) {
                buffered(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'foo',
                    '',
                    'bar',
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\n\nbar');

                    buffered(method, 'echo', [
                        'foo',
                        '',
                        'bar',
                    ], function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('foo  bar');

                        next();
                    });
                });
            });

            it('should handle non-string arguments', function (next) {
                buffered(method, 'node', [
                    __dirname + '/fixtures/echo',
                    1234,
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('1234');

                    next();
                });
            });

            it('should handle arguments with spaces', function (next) {
                buffered(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'I am',
                    'André Cruz',
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('I am\nAndré Cruz');

                    next();
                });
            });

            it('should handle arguments with \\"', function (next) {
                buffered(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'foo',
                    '\\"',
                    'bar',
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\n\\"\nbar');

                    next();
                });
            });

            it('should handle arguments that end with \\', function (next) {
                buffered(method, 'node', [
                    __dirname + '/fixtures/echo',
                    'foo',
                    'bar\\',
                    'baz',
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\nbar\\\nbaz');

                    next();
                });
            });

            it('should handle arguments that contain shell special chars', function (next) {
                buffered(method, 'node', [
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
                    'foo',
                ], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data).to.equal('foo\n()\nfoo\n%!\nfoo\n^<\nfoo\n>&\nfoo\n|;\nfoo\n, \nfoo');

                    next();
                });
            });

            it('should handle special arguments when using echo', function (next) {
                buffered(method, 'echo', ['foo\\"foo\\foo&bar"foo\'bar'], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('foo\\"foo\\foo&bar"foo\'bar');

                    buffered(method, 'echo', [
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
                        'foo',
                    ], function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('foo () foo %! foo ^< foo >& foo |; foo ,  foo');

                        next();
                    });
                });
            });

            it('should handle optional args correctly', function (next) {
                buffered(method, __dirname + '/fixtures/foo', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);

                    buffered(method, __dirname + '/fixtures/foo', {
                        stdio: ['pipe', 'pipe', 'pipe'],
                    }, function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);

                        buffered(method, __dirname + '/fixtures/foo', null, {
                            stdio: ['pipe', 'pipe', 'pipe'],
                        }, function (err, data, code) {
                            expect(err).to.not.be.ok();
                            expect(code).to.be(0);

                            next();
                        });
                    });
                });
            });

            it('should not mutate args nor options', function (next) {
                var args = [];
                var options = {};

                buffered(method, __dirname + '/fixtures/foo', function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);

                    expect(args).to.have.length(0);
                    expect(Object.keys(options)).to.have.length(0);

                    next();
                });
            });

            it('should give correct exit code', function (next) {
                buffered(method, 'node', [__dirname + '/fixtures/exit'], function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(25);

                    next();
                });
            });

            it('should work with a relative command', function (next) {
                buffered(method, path.relative(process.cwd(), __dirname + '/fixtures/foo'), function (err, data, code) {
                    expect(err).to.not.be.ok();
                    expect(code).to.be(0);
                    expect(data.trim()).to.equal('foo');

                    if (!isWin) {
                        return next();
                    }

                    buffered(method, path.relative(process.cwd(), __dirname + '/fixtures/foo.bat'), function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('foo');

                        next();
                    });
                });
            });

            it('should emit "error" and "close" if command does not exist', function (next) {
                var errors;
                var spawned = spawn[method]('somecommandthatwillneverexist');

                this.timeout(5000);

                function assertError(err) {
                    var syscall = method === 'sync' ? 'spawnSync' : 'spawn';

                    expect(err).to.be.an(Error);
                    expect(err.message).to.contain(syscall);
                    expect(err.message).to.contain('ENOENT');
                    expect(err.message).to.not.contain('undefined');
                    expect(err.code).to.be('ENOENT');
                    expect(err.errno).to.be('ENOENT');
                    expect(err.syscall).to.contain(syscall);
                    expect(err.syscall).to.not.contain('undefined');
                }

                if (method === 'spawn') {
                    errors = [];

                    spawned
                    .on('error', function (err) {
                        errors.push(err);
                    })
                    .on('exit', function () {
                        spawned.removeAllListeners();
                        next(new Error('Should not emit exit'));
                    })
                    .on('close', function (code, signal) {
                        expect(code).to.not.be(0);
                        expect(signal).to.be(null);

                        setTimeout(function () {
                            expect(errors).to.have.length(1);
                            assertError(errors[0]);

                            next();
                        }, 1000);
                    });
                } else {
                    assertError(spawned.error);
                    next();
                }
            });

            it('should NOT emit "error" if shebang command does not exist', function (next) {
                var spawned = spawn[method](__dirname + '/fixtures/shebang_enoent');
                var exited;
                var timeout;

                this.timeout(5000);

                if (method === 'spawn') {
                    spawned
                    .on('error', function () {
                        spawned.removeAllListeners();
                        clearTimeout(timeout);
                        next(new Error('Should not emit error'));
                    })
                    .on('exit', function () {
                        exited = true;
                    })
                    .on('close', function (code, signal) {
                        expect(code).to.not.be(0);
                        expect(signal).to.be(null);
                        expect(exited).to.be(true);

                        timeout = setTimeout(next, 1000);
                    });
                } else {
                    expect(spawned.error).to.not.be.ok();
                    next();
                }
            });

            it('should NOT emit "error" if the command actual exists but exited with 1', function (next) {
                var spawned = spawn[method](__dirname + '/fixtures/exit1');
                var exited;
                var timeout;

                this.timeout(5000);

                if (method === 'spawn') {
                    spawned
                    .on('error', function () {
                        spawned.removeAllListeners();
                        clearTimeout(timeout);
                        next(new Error('Should not emit error'));
                    })
                    .on('exit', function () {
                        exited = true;
                    })
                    .on('close', function (code, signal) {
                        expect(code).to.not.be(0);
                        expect(signal).to.be(null);
                        expect(exited).to.be(true);

                        timeout = setTimeout(next, 1000);
                    });
                } else {
                    expect(spawned.error).to.not.be.ok();
                    next();
                }
            });

            if (isWin) {
                it('should use nodejs\' spawn when option.shell is specified', function (next) {
                    buffered(method, 'echo', ['%RANDOM%'], { shell: true }, function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.match(/\d+/);

                        buffered(method, 'echo', ['%RANDOM%'], { shell: false }, function (err, data) {
                            // In some windows versions, the echo exists outside the shell as echo.exe so we must account for that here
                            if (err) {
                                expect(err).to.be.an(Error);
                                expect(err.message).to.contain('ENOENT');
                            } else {
                                expect(data.trim()).to.equal('%RANDOM%');
                            }

                            next();
                        });
                    });
                });
            } else {
                it('should use nodejs\' spawn when option.shell is specified', function (next) {
                    buffered(method, 'echo', ['hello &&', 'echo there'], { shell: true }, function (err, data, code) {
                        expect(err).to.not.be.ok();
                        expect(code).to.be(0);
                        expect(data.trim()).to.equal('hello\nthere');

                        buffered(method, 'echo', ['hello &&', 'echo there'], { shell: false }, function (err, data) {
                            expect(err).to.not.be.ok();
                            expect(code).to.be(0);
                            expect(data.trim()).to.equal('hello && echo there');

                            next();
                        });
                    });
                });
            }

            if (isWin) {
                if (hasEmptyArgumentBug) {
                    it('should spawn a shell for a .exe on old Node', function (next) {
                        buffered(method, __dirname + '/fixtures/win-ppid.js', function (err, data, code) {
                            expect(err).to.not.be.ok();
                            expect(code).to.be(0);
                            expect(data.trim()).to.not.equal('' + process.pid);
                            next();
                        });
                    });
                } else {
                    it('should NOT spawn a shell for a .exe', function (next) {
                        buffered(method, __dirname + '/fixtures/win-ppid.js', function (err, data, code) {
                            expect(err).to.not.be.ok();
                            expect(code).to.be(0);
                            expect(data.trim()).to.equal('' + process.pid);
                            next();
                        });
                    });
                }
            }

            it('should not mutate passed `options` or `env` objects', function (next) {
                var options = {
                    env: {
                        a: 'a',
                        b: 'b',
                    },
                };
                var env = options.env;
                var optionsClone = assign({}, options);
                var envClone = assign({}, env);

                buffered(method, __dirname + '/fixtures/foo', options, function (err) {
                    expect(err).to.not.be.ok();
                    expect(options).to.eql(optionsClone);
                    expect(env).to.eql(envClone);
                    next();
                });
            });
        });
    });
});
