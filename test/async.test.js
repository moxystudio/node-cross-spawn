'use strict';

const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const pathKey = require('path-key')();
const crossSpawn = require('../index');

jest.setTimeout(10000);

describe('async', () => {
    const originalPathEnv = process.env[pathKey];

    beforeAll(() => mkdirp.sync(`${__dirname}/tmp`));

    afterAll(() => rimraf.sync(`${__dirname}/tmp`));

    afterEach(() => {
        jest.restoreAllMocks();

        process.env[pathKey] = originalPathEnv;
    });

    it('should have stdout, stderr, and err property', async () => {
        const child = await crossSpawn.async('echo', ['hello', 'world']);

        expect(child).toHaveProperty('stdout'); // Check child.stdout
        expect(child).toHaveProperty('stderr'); // Check child.stderr
        expect(child).toHaveProperty('err'); // Check child.err

        expect(typeof child.stdout).toBe('string'); // Check child.stdout is string
        expect(typeof child.stderr).toBe('string'); // Check child.stderr is string
        expect(child.err === null).toBe(true); // Check child.err is null
    });
});
