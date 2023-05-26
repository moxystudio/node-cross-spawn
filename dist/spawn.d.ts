/// <reference types="node" />
/// <reference types="node" />
import cp from 'child_process';
import enoent from './lib/enoent';
import parse from './lib/parse';
/**
 * @description
 * @param command - Command.
 * @param  args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
export declare function spawn(command: string, args: string[] | cp.SpawnOptions, options?: import('child_process').SpawnOptions): cp.ChildProcessWithoutNullStreams;
/**
 * return of require('child_process').spawnSync
 */
export type spawnSyncReturn = cp.SpawnSyncReturns<Buffer | string> | {
    [key: string]: any;
    status: number;
    signal: any;
    output: (null | Buffer)[];
    pid: number;
    stdout: Buffer;
    stderr: Buffer;
    error: any;
};
/**
 * @description
 * @param command - Command.
 * @param args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
export declare function spawnSync(command: string, args: string[], options?: cp.SpawnOptions): spawnSyncReturn;
/**
 * Spawn asynchronously.
 * @description
 * @param command - Command.
 * @param args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
export declare function spawnAsync(command: string, args: string[], options?: import('child_process').SpawnOptions): Promise<{
    stdout: string;
    stderr: string;
    output: string;
    error: string | null;
}>;
export declare const _enoent: typeof enoent;
export declare const _parse: typeof parse;
export declare const async: typeof spawnAsync;
export declare const sync: typeof spawnSync;
//# sourceMappingURL=spawn.d.ts.map