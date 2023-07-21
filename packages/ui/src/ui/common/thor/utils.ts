//@ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {appendInnerErrors} from '../../utils/errors';

export function convertToNumber<T extends number | undefined>(
    value: any,
    defaultValue?: T,
): number | T {
    if (value === null) return defaultValue as T;
    if (value === undefined) return defaultValue as T;
    const res = Number(value);
    if (isNaN(res) && defaultValue === undefined) {
        throw new Error('convertToNumber: value "' + value + '" cannot be converted to number.');
    }
    return isNaN(res) ? (defaultValue as T) : res;
}

export const getNumber = function <T extends number | undefined>(
    node: any,
    path: string,
    defaultValue?: T,
) {
    try {
        let value;
        if (typeof path === 'undefined') {
            value = node;
        } else {
            value = ypath.get(node, path);
        }
        return convertToNumber(value, defaultValue);
    } catch (e) {
        throw appendInnerErrors(e, {
            message: `getNumber: failed to convert field with path: "${path}".`,
        });
    }
};
