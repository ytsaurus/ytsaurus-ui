// @ts-expect-error — interface-helpers ships untyped ypath
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

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

export function getNumberBase<T extends number | undefined>(node: any, path: string, defaultValue?: T) {
    let value;
    if (typeof path === 'undefined') {
        value = node;
    } else {
        value = ypath.getValue(node, path);
    }
    return convertToNumber(value, defaultValue);
}

/** @deprecated Prefer named imports; kept for thorYPath spread and legacy imports. */
export const ypathBase = {
    getNumberBase,
};
