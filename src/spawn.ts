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
export function spawn(
  command: string,
  args: string[] | cp.SpawnOptions,
  options?: import('child_process').SpawnOptions
) /*:import('child_process').ChildProcess*/ {
  // Parse the arguments
  const parsed = parse(command, args, options);

  // Spawn the child process
  const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

  // Hook into child process "exit" event to emit an error if the command
  // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
  enoent.hookChildProcess(spawned, parsed);

  return spawned;
}

/**
 * return of require('child_process').spawnSync
 */
export type spawnSyncReturn =
  | ReturnType<typeof cp.spawnSync>
  | {
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
export function spawnSync(command: string, args: string[], options?: cp.SpawnOptions): spawnSyncReturn {
  // Parse the arguments
  const parsed = parse(command, args, options);

  // Spawn the child process
  const result = cp.spawnSync(parsed.command, parsed.args, parsed.options) as spawnSyncReturn;

  // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
  result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

  return result;
}

/**
 * Spawn asynchronously.
 * @description
 * @param command - Command.
 * @param args - Arguments.
 * @param options - Spawn Options.
 * @returns Return Promise.
 */
export function spawnAsync(
  command: string,
  args: string[],
  options?: import('child_process').SpawnOptions
): Promise<{ stdout: string; stderr: string; output: string; error: string | null }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, args, options);

    // Capture stdout
    if (child.stdout && 'on' in child.stdout) {
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        stdout += data;
      });
    }

    // Capture stderr
    if (child.stderr && 'on' in child.stdout) {
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        stderr += data;
      });
    }

    child.on('close', (code, signal) => {
      // Should probably be 'exit', not 'close'
      /* if (code !== 0) {
                console.log('[ERROR]', command, ...args, 'dies with code', code, 'signal', signal);
            }*/
      // Process completed
      resolve({
        stdout,
        stderr,
        error: code !== 0 ? [command, ...args, 'dies with code', code, 'signal', signal].join(' ') : null,
        output: `${stdout}\n\n${stderr}`
      });
    });

    /*
        child.on('error', function (err) {
            // Process creation failed
            resolve(err);
        });*/
  });
}

export default spawn;
export const _enoent = enoent;
export const _parse = parse;
export const async = spawnAsync;
export const sync = spawnSync;
