/**
 * Checks that the value is a non-negative number.
 *
 * @param value - The value being checked.
 *
 * @example
 * ```ts
 * isPositiveOrZeroNumber(42) // true
 * isPositiveOrZeroNumber(42.5) // true
 * isPositiveOrZeroNumber(Infinity) // true
 * isPositiveOrZeroNumber(0) // true
 * isPositiveOrZeroNumber(-1) // false
 * isPositiveOrZeroNumber('42') // false
 * isPositiveOrZeroNumber(NaN) // false
 * ```
 */
export const isPositiveOrZeroNumber = (value: unknown): value is number => {
    return typeof value === 'number' && value >= 0;
};
