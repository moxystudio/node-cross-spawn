/**
 * @param cp
 * @param parsed
 */
export function hookChildProcess(cp: any, parsed: any): void;
/**
 * @param status
 * @param parsed
 */
export function verifyENOENT(status: any, parsed: any): Error & {
    code: string;
    errno: string;
    syscall: string;
    path: any;
    spawnargs: any;
};
/**
 * @param status
 * @param parsed
 */
export function verifyENOENTSync(status: any, parsed: any): Error & {
    code: string;
    errno: string;
    syscall: string;
    path: any;
    spawnargs: any;
};
/**
 * @param original
 * @param syscall
 */
export function notFoundError(original: any, syscall: any): Error & {
    code: string;
    errno: string;
    syscall: string;
    path: any;
    spawnargs: any;
};
//# sourceMappingURL=enoent.d.ts.map