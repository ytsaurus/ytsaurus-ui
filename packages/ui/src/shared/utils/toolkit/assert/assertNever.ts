import {throwError} from './utils';

/**
 * Throws an error for a value that should never occur.
 *
 * @example
 * ```ts
 * function getLabel(value: 'first' | 'second'): string {
 *     switch (value) {
 *         case 'first':
 *             return 'First';
 *         case 'second':
 *             return 'Second';
 *     }
 *
 *     return assertNever(value);
 * }
 * ```
 *
 * @param value The value that should never occur.
 * @param error The error or error message to throw.
 * @returns Nothing.
 */
export function assertNever(value: never, error?: Error | string): never {
    return throwError(error ?? `Unexpected value '${value}'!`);
}
