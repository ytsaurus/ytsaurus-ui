/**
 * Helper function that concatenates validators
 * @param validators
 * @returns
 */
export function concatValidators<T, R>(...validators: Array<(v: T) => R>) {
    return (v: T) => {
        for (const item of validators) {
            const res = item(v);
            if (res) {
                return res;
            }
        }
        return undefined;
    };
}
