'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const childProcess = require('child_process');
const pathKey = require('path-key')();
const run = require('./util/run');

const isWin = process.platform === 'win32';

jest.setTimeout(10000);

run.methods.forEach((method) => {
    describe(method, () => {
        const originalPathEnv = process.env[pathKey];

        beforeAll(() => mkdirp.sync(`${__dirname}/tmp`));

        afterAll(() => rimraf.sync(`${__dirname}/tmp`));

        afterEach(() => {
            jest.restoreAllMocks();

            process.env[pathKey] = originalPathEnv;
        });

        it('should expand using PATHEXT properly', async () => {
            const { stdout } = await run(method, `${__dirname}/fixtures/say-foo`);

            expect(stdout.trim()).toBe('foo');
        });

        it('should support shebang in executables with `/usr/bin/env`', async () => {
            const { stdout: stdout1 } = await run(method, `${__dirname}/fixtures/shebang`);

            expect(stdout1).toBe('shebang works!');

            // Test if the actual shebang file is resolved against the options.env.PATH
            const { stdout: stdout2 } = await run(method, 'shebang', {
                env: {
                    ...process.env,
                    [pathKey]: path.normalize(`${__dirname}/fixtures`) + path.delimiter + process.env[pathKey],
                },
            });

            expect(stdout2).toBe('shebang works!');

            // Test if the actual shebang file is resolved against the process.env.PATH
            process.env[pathKey] = path.normalize(`${__dirname}/fixtures`) + path.delimiter + process.env[pathKey];

            // Need to do a little hack for unix because of a Jest bug
            // Remove this later when it's solved: https://github.com/facebook/jest/issues/5362
            if (!isWin) {
                const originalSpawn = childProcess.spawn;
                const originalSpawnSync = childProcess.spawnSync;

                jest.spyOn(childProcess, 'spawn').mockImplementation((command, args, options) =>
                    originalSpawn(command, args, { ...options, env: process.env }));
                jest.spyOn(childProcess, 'spawnSync').mockImplementation((command, args, options) =>
                    originalSpawnSync(command, args, { ...options, env: process.env }));
            }

            const { stdout: stdout3 } = await run(method, 'shebang');

            expect(stdout3).toBe('shebang works!');
        });

        it('should handle commands with special shell chars', async () => {
            fs.writeFileSync(
                `${__dirname}/fixtures/()%!^&;, `,
                fs.readFileSync(`${__dirname}/fixtures/pre_()%!^&;, .sh`),
                { mode: 0o0777 }
            );
            fs.writeFileSync(
                `${__dirname}/fixtures/()%!^&;, .bat`,
                fs.readFileSync(`${__dirname}/fixtures/pre_()%!^&;, .bat`)
            );

            const { stdout } = await run(method, `${__dirname}/fixtures/()%!^&;, `);

            expect(stdout.trim()).toBe('special');
        });

        it('should handle empty arguments and arguments with spaces', async () => {
            const { stdout } = await run(method, 'node', [
                `${__dirname}/fixtures/echo`,
                'foo',
                '',
                'bar',
                'André Cruz',
            ]);

            expect(stdout).toBe('foo\n\nbar\nAndré Cruz');
        });

        it('should handle non-string arguments', async () => {
            const { stdout } = await run(method, 'node', [
                `${__dirname}/fixtures/echo`,
                1234,
            ]);

            expect(stdout).toBe('1234');
        });

        it('should handle arguments with shell special chars', async () => {
            const args = [
                'foo',
                '()',
                'foo',
                '[]',
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
                '!=',
                'foo',
                '\\*',
                'foo',
                '"f"',
                'foo',
                '?.',
                'foo',
                '=`',
                'foo',
                '\'',
                'foo',
                '\\"',
                'bar\\',
                // See https://github.com/IndigoUnited/node-cross-spawn/issues/82
                '"foo|bar>baz"',
                '"(foo|bar>baz|foz)"',
            ];

            const { stdout } = await run(method, 'node', [`${__dirname}/fixtures/echo`].concat(args));

            expect(stdout).toBe(args.join('\n'));
        });

        if (isWin) {
            it('should double escape when executing `node_modules/.bin/<file>.cmd`', async () => {
                mkdirp.sync(`${__dirname}/fixtures/node_modules/.bin`);
                fs.writeFileSync(`${__dirname}/fixtures/node_modules/.bin/echo-cmd-shim.cmd`,
                    fs.readFileSync(`${__dirname}/fixtures/echo-cmd-shim.cmd`));

                const arg = '"(foo|bar>baz|foz)"';

                const { stdout } = await run(method, `${__dirname}/fixtures/node_modules/.bin/echo-cmd-shim`, [arg]);

                expect(stdout).toBe(arg);
            });
        }

        it('should handle commands with names of environment variables', async () => {
            const { stdout } = await run(method, `${__dirname}/fixtures/%CD%`);

            expect(stdout.trim()).toBe('special');
        });

        it('should handle optional spawn optional arguments correctly', async () => {
            const { stdout: stdout1 } = await run(method, `${__dirname}/fixtures/say-foo`);

            expect(stdout1.trim()).toBe('foo');

            const { stdout: stdout2 } = await run(method, `${__dirname}/fixtures/say-foo`, { stdio: 'ignore' });

            expect(stdout2).toBe(null);

            const { stdout: stdout3 } = await run(method, `${__dirname}/fixtures/say-foo`, null, { stdio: 'ignore' });

            expect(stdout3).toBe(null);
        });

        it('should not mutate args nor options', async () => {
            const args = [];
            const options = {};

            await run(method, `${__dirname}/fixtures/say-foo`, args, options);

            expect(args).toEqual([]);
            expect(options).toEqual({});
        });

        it('should give correct exit code', async () => {
            expect.assertions(1);

            try {
                await run(method, 'node', [`${__dirname}/fixtures/exit-25`]);
            } catch (err) {
                expect(err.exitCode).toBe(25);
            }
        });

        it('should work with a relative posix path to a command', async () => {
            const relativeFixturesPath = path.relative(process.cwd(), `${__dirname}/fixtures`).replace(/\\/, '/');

            const { stdout: stdout1 } = await run(method, `${relativeFixturesPath}/say-foo`);

            expect(stdout1.trim()).toBe('foo');

            const { stdout: stdout2 } = await run(method, `./${relativeFixturesPath}/say-foo`);

            expect(stdout2.trim()).toBe('foo');

            if (!isWin) {
                return;
            }

            const { stdout: stdout3 } = await run(method, `./${relativeFixturesPath}/say-foo.bat`);

            expect(stdout3.trim()).toBe('foo');
        });

        it('should work with a relative posix path to a command with a custom `cwd`', async () => {
            const relativeTestPath = path.relative(process.cwd(), __dirname).replace(/\\/, '/');

            const { stdout: stdout1 } = await run(method, 'fixtures/say-foo', { cwd: relativeTestPath });

            expect(stdout1.trim()).toBe('foo');

            const { stdout: stdout2 } = await run(method, './fixtures/say-foo', { cwd: `./${relativeTestPath}` });

            expect(stdout2.trim()).toBe('foo');

            if (!isWin) {
                return;
            }

            const { stdout: stdout3 } = await run(method, './fixtures/say-foo.bat', { cwd: `./${relativeTestPath}` });

            expect(stdout3.trim()).toBe('foo');
        });

        {
            const assertError = (err) => {
                const syscall = run.isMethodSync(method) ? 'spawnSync' : 'spawn';

                expect(err.message).toMatch(syscall);
                expect(err.message).toMatch('ENOENT');
                expect(err.message).not.toMatch('undefined');
                expect(err.code).toBe('ENOENT');
                expect(err.errno).toBe('ENOENT');
                expect(err.syscall).toMatch(syscall);
                expect(err.syscall).not.toMatch('undefined');
                expect(err.path).toMatch('somecommandthatwillneverexist');
                expect(err.spawnargs).toEqual(['foo']);
            };

            if (run.isMethodSync(method)) {
                it('should fail with ENOENT if the command does not exist', () => {
                    expect.assertions(9);

                    try {
                        run(method, 'somecommandthatwillneverexist', ['foo']);
                    } catch (err) {
                        assertError(err);
                    }
                });
            } else {
                it('should emit `error` and `close` if command does not exist', async () => {
                    expect.assertions(11);

                    await new Promise((resolve, reject) => {
                        const promise = run(method, 'somecommandthatwillneverexist', ['foo']);
                        const { cp } = promise;

                        promise.catch(() => {});

                        let timeout;

                        cp
                        .on('error', assertError)
                        .on('exit', () => {
                            cp.removeAllListeners();
                            clearTimeout(timeout);
                            reject(new Error('Should not emit exit'));
                        })
                        .on('close', (code, signal) => {
                            expect(code).not.toBe(0);
                            expect(signal).toBe(null);

                            timeout = setTimeout(resolve, 1000);
                        });
                    });
                });
            }
        }

        if (run.isMethodSync(method)) {
            it('should NOT fail with ENOENT if the command actual exists but exited with 1', () => {
                expect.assertions(1);

                try {
                    run(method, `${__dirname}/fixtures/exit-1`);
                } catch (err) {
                    expect(err.code).not.toBe('ENOENT');
                }
            });
        } else {
            it('should NOT emit `error` if the command actual exists but exited with 1', async () => {
                await new Promise((resolve, reject) => {
                    const promise = run(method, `${__dirname}/fixtures/exit-1`);
                    const { cp } = promise;

                    promise.catch(() => {});

                    const onExit = jest.fn(() => {});
                    let timeout;

                    cp
                    .on('error', () => {
                        cp.removeAllListeners();
                        clearTimeout(timeout);
                        reject(new Error('Should not emit error'));
                    })
                    .on('exit', onExit)
                    .on('close', (code, signal) => {
                        expect(code).toBe(1);
                        expect(signal).toBe(null);
                        expect(onExit).toHaveBeenCalledTimes(1);
                        expect(onExit).toHaveBeenCalledWith(1, null);

                        timeout = setTimeout(resolve, 1000);
                    });
                });
            });
        }

        if (run.isMethodSync(method)) {
            it('should NOT fail with ENOENT if shebang command does not exist', () => {
                expect.assertions(1);

                try {
                    run(method, `${__dirname}/fixtures/shebang-enoent`);
                } catch (err) {
                    expect(err.code).not.toBe('ENOENT');
                }
            });
        } else {
            it('should NOT emit `error` if shebang command does not exist', async () => {
                await new Promise((resolve, reject) => {
                    const promise = run(method, `${__dirname}/fixtures/shebang-enoent`);
                    const { cp } = promise;

                    promise.catch(() => {});

                    const onExit = jest.fn(() => {});
                    let timeout;

                    cp
                    .on('error', () => {
                        cp.removeAllListeners();
                        clearTimeout(timeout);
                        reject(new Error('Should not emit error'));
                    })
                    .on('exit', onExit)
                    .on('close', (code, signal) => {
                        expect(code).not.toBe(0);
                        expect(signal).toBe(null);
                        expect(onExit).toHaveBeenCalledTimes(1);
                        expect(onExit).not.toHaveBeenCalledWith(0, null);

                        timeout = setTimeout(resolve, 1000);
                    });
                });
            });
        }

        if (run.isMethodSync(method)) {
            it('should fail with ENOENT a non-existing `cwd` was specified', () => {
                expect.assertions(1);

                try {
                    run(method, 'fixtures/say-foo', { cwd: 'somedirthatwillneverexist' });
                } catch (err) {
                    expect(err.code).toBe('ENOENT');
                }
            });
        } else {
            it('should emit `error` and `close` if a non-existing `cwd` was specified', async () => {
                expect.assertions(3);

                await new Promise((resolve, reject) => {
                    const promise = run(method, 'somecommandthatwillneverexist', ['foo']);
                    const { cp } = promise;

                    promise.catch(() => {});

                    let timeout;

                    cp
                    .on('error', (err) => expect(err.code).toBe('ENOENT'))
                    .on('exit', () => {
                        cp.removeAllListeners();
                        clearTimeout(timeout);
                        reject(new Error('Should not emit exit'));
                    })
                    .on('close', (code, signal) => {
                        expect(code).not.toBe(0);
                        expect(signal).toBe(null);

                        timeout = setTimeout(resolve, 1000);
                    });
                });
            });
        }

        if (isWin) {
            it('should use nodejs\' spawn when options.shell is specified (windows)', async () => {
                const { stdout } = await run(method, 'echo', ['%RANDOM%'], { shell: true });

                expect(stdout.trim()).toMatch(/\d+/);
            });
        } else {
            it('should use nodejs\' spawn when options.shell is specified (linux)', async () => {
                const { stdout } = await run(method, 'echo', ['hello &&', 'echo there'], { shell: true });

                expect(stdout.trim()).toEqual('hello\nthere');
            });
        }

        if (isWin && !run.isForceShell(method)) {
            it('should NOT spawn a shell for a .exe', async () => {
                const { stdout } = await run(method, `${__dirname}/fixtures/win-ppid.js`);

                expect(Number(stdout.trim())).toBe(process.pid);
            });
        }

        if (isWin) {
            const differentPathKey = pathKey.startsWith('p') ? 'PATH' : 'path';

            it('should work if the path key is different in options.env', async () => {
                const env = {
                    ...process.env,
                    [differentPathKey]: `${__dirname}\\fixtures;${process.env[pathKey]}`,
                };

                delete env[pathKey];

                const { stdout } = await run(method, 'whoami', { env });

                expect(stdout.trim()).toBe('you sure are someone');
            });
        }
    });
});
