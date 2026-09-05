import {throwError} from './utils';

/**
 * Asserts that a value is truthy. Throws an error otherwise.
 *
 * @example
 * ```ts
 * assert(false); // Throws AssertionError('Value must be truthy.')
 * assert(true); // Returns void
 * assert(false, 'Oops!'); // Throws AssertionError('Oops!')
 * ```
 *
 * @param value The value to assert.
 * @param error The error or error message to throw when the assertion fails.
 * @returns Nothing.
 */
export function assert(value: unknown, error?: Error | string): asserts value {
    if (value) {
        return;
    }

    throwError(error ?? 'Value must be truthy.');
}
