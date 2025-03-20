// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

const VALUE_KEY = '$value';
const ATTRS_KEY = '$attributes';
const yson = {
    value(node?: Record<string, unknown>) {
        return node?.[VALUE_KEY] !== undefined ? node[VALUE_KEY] : node;
    },
    attributes(node?: Record<string, unknown>) {
        return node?.[ATTRS_KEY] !== undefined ? node[ATTRS_KEY] : {};
    },
};

export const ypathBase = {
    get(node: unknown, path: string) {
        if (typeof path === 'undefined') {
            return node;
        } else {
            return ypath.get(node, path);
        }
    },

    getAttributes(node: unknown, path: string) {
        return yson.attributes(ypathBase.get(node, path));
    },

    getValue(node: unknown, path: string) {
        return yson.value(ypathBase.get(node, path));
    },

    getValues(node: unknown, paths: Array<string>) {
        return ypath.getValues(node, paths);
    },

    getNumberBase<T extends number | undefined>(node: any, path: string, defaultValue?: T) {
        let value;
        if (typeof path === 'undefined') {
            value = node;
        } else {
            value = ypath.getValue(node, path);
        }
        return convertToNumber(value, defaultValue);
    },
};

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
