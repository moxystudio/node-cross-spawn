'use strict';

const fs = require('fs');
const path = require('path');
const readShebang = require('./readShebang');

describe('readShebang', () => {
    afterEach(() => jest.restoreAllMocks());

    it('should read the shebang command', () => {
        const close = jest.spyOn(fs, 'closeSync');

        expect(readShebang(path.join(__dirname, '../../test/fixtures/shebang'))).toBe('node');
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('should return null if the file has no shebang', () => {
        expect(readShebang(path.join(__dirname, '../../test/fixtures/echo.js'))).toBe(null);
    });

    it('should close the file descriptor when reading fails, including descriptor zero', () => {
        jest.spyOn(fs, 'openSync').mockReturnValue(0);
        jest.spyOn(fs, 'readSync').mockImplementation(() => {
            throw new Error('read failed');
        });
        const close = jest.spyOn(fs, 'closeSync').mockImplementation(() => {});

        expect(readShebang('command')).toBe(null);
        expect(close).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledWith(0);
    });

    it('should close the file descriptor when the file is a directory', () => {
        const open = jest.spyOn(fs, 'openSync');
        const close = jest.spyOn(fs, 'closeSync');

        expect(readShebang(__dirname)).toBe(null);

        // Opening a directory fails on Windows, but succeeds on other platforms and then reading fails
        expect(close).toHaveBeenCalledTimes(open.mock.results.filter((result) => result.type === 'return').length);
    });

    it('should not close a file descriptor when opening fails', () => {
        jest.spyOn(fs, 'openSync').mockImplementation(() => {
            throw new Error('open failed');
        });
        const close = jest.spyOn(fs, 'closeSync').mockImplementation(() => {});

        expect(readShebang('command')).toBe(null);
        expect(close).not.toHaveBeenCalled();
    });

    it('should return null when closing also fails', () => {
        jest.spyOn(fs, 'openSync').mockReturnValue(0);
        jest.spyOn(fs, 'readSync').mockImplementation(() => {
            throw new Error('read failed');
        });
        jest.spyOn(fs, 'closeSync').mockImplementation(() => {
            throw new Error('close failed');
        });

        expect(readShebang('command')).toBe(null);
    });
});
