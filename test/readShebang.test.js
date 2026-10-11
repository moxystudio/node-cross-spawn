'use strict';

const fs = require('fs');
const path = require('path');
const readShebang = require('../lib/util/readShebang');

describe('readShebang', () => {
    afterEach(() => jest.restoreAllMocks());

    it('closes an opened descriptor when reading fails, including descriptor zero', () => {
        jest.spyOn(fs, 'openSync').mockReturnValue(0);
        jest.spyOn(fs, 'readSync').mockImplementation(() => {
            throw new Error('read failed');
        });
        const close = jest.spyOn(fs, 'closeSync').mockImplementation(() => {});

        expect(readShebang('command')).toBeNull();
        expect(close).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledWith(0);
    });

    it('does not close a descriptor when opening fails', () => {
        jest.spyOn(fs, 'openSync').mockImplementation(() => {
            throw new Error('open failed');
        });
        const close = jest.spyOn(fs, 'closeSync').mockImplementation(() => {});

        expect(readShebang('command')).toBeNull();
        expect(close).not.toHaveBeenCalled();
    });

    it('preserves the fallback when closing also fails', () => {
        jest.spyOn(fs, 'openSync').mockReturnValue(0);
        jest.spyOn(fs, 'readSync').mockImplementation(() => {
            throw new Error('read failed');
        });
        jest.spyOn(fs, 'closeSync').mockImplementation(() => {
            throw new Error('close failed');
        });

        expect(readShebang('command')).toBeNull();
    });

    it('still reads a valid shebang', () => {
        const close = jest.spyOn(fs, 'closeSync');
        const command = path.join(__dirname, 'fixtures/shebang');

        expect(readShebang(command)).toBe('node');
        expect(close).toHaveBeenCalledTimes(1);
    });
});
