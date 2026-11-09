'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const resolveCommand = require('./resolveCommand');

describe('resolveCommand', () => {
    let tmpDir;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-spawn-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    const makeParsed = (command, options) => ({ command, options: options || {} });

    it('should resolve a command on the PATH to an absolute path', () => {
        const resolved = resolveCommand(makeParsed('node'));

        expect(typeof resolved).toBe('string');
        expect(path.isAbsolute(resolved)).toBe(true);
    });

    it('should return undefined for a command that does not exist', () => {
        const resolved = resolveCommand(makeParsed('somecommandthatwillneverexist'));

        expect(resolved).toBe(undefined);
    });

    it('should resolve a command from a custom env PATH', () => {
        const binDir = path.join(tmpDir, 'bin');

        fs.mkdirSync(binDir);
        const exe = path.join(binDir, 'mytool');

        fs.writeFileSync(exe, '#!/bin/sh\n', { mode: 0o755 });

        const env = { PATH: binDir };
        const resolved = resolveCommand(makeParsed('mytool', { env }));

        expect(resolved).toBe(exe);
    });

    it('should switch to a custom cwd while resolving and restore it afterwards', () => {
        const cwdBefore = process.cwd();
        const customCwd = path.join(tmpDir, 'workdir');

        fs.mkdirSync(customCwd);

        const resolved = resolveCommand(makeParsed('node', { cwd: customCwd }));

        expect(process.cwd()).toBe(cwdBefore);
        expect(typeof resolved).toBe('string');
    });

    it('should resolve relative to the custom cwd', () => {
        const customCwd = path.join(tmpDir, 'workdir');

        fs.mkdirSync(customCwd);
        const binDir = path.join(tmpDir, 'bin');

        fs.mkdirSync(binDir);
        const exe = path.join(binDir, 'mytool');

        fs.writeFileSync(exe, '#!/bin/sh\n', { mode: 0o755 });

        const env = { PATH: binDir };
        const resolved = resolveCommand(makeParsed('mytool', { env, cwd: customCwd }));

        // Resolved absolute path is based on the custom cwd
        expect(resolved).toBe(path.resolve(customCwd, exe));
    });
});
