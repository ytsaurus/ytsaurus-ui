import {assert} from './assert';

/**
 * Asserts that a value is a string. Throws an error otherwise.
 *
 * @example
 * ```ts
 * assertString('some_string'); // Returns void
 * assertString({}); // Throws AssertionError('Value must be a string.')
 * ```
 *
 * @param value The value to assert.
 * @param error The error or error message to throw when the assertion fails.
 * @returns Nothing.
 */
export function assertString(value: unknown, error?: Error | string): asserts value is string {
    assert(typeof value === 'string', error ?? 'Value must be a string.');
}
