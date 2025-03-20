// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import unipika from './unipika';
import {appendInnerErrors} from '../../utils/errors';
import {ypathBase} from './ypath-base';

const yson = unipika.utils.yson;

function convertToBoolean(value?: boolean | string): boolean | undefined {
    value = yson.value(value);

    const type = unipika.utils.type(value);

    if (type === 'string' && (value === 'true' || value === 'false')) {
        return value === 'true';
    } else if (type === 'boolean' || type === 'undefined') {
        return value as boolean | undefined;
    } else {
        throw new Error('thorYPath: value cannot be converted to boolean.');
    }
}

/** @deprecated */
function convertToNumberOld(value: number | string, defaultValue?: number): number | undefined {
    value = yson.value(value);

    const type = unipika.utils.type(value);

    if (type === 'string') {
        const converted = Number(value);

        if (isFinite(converted)) {
            return converted;
        } else {
            if (defaultValue !== undefined) {
                return isNaN(defaultValue) ? undefined : defaultValue;
            }
            throw new Error('thorYPath: value "' + value + '" cannot be converted to number.');
        }
    } else if (type === 'number' || type === 'undefined') {
        return isNaN(value as number) && defaultValue !== undefined
            ? defaultValue
            : (value as number | undefined);
    } else {
        if (defaultValue !== undefined) {
            return isNaN(defaultValue) ? undefined : defaultValue;
        }
        throw new Error('thorYPath: value "' + value + '" cannot be converted to number.');
    }
}

// Simple wrapper for ypath that unwraps observables passed to ypath methods
/**
 */

const thorYPath = {
    ...ypath,
    ...ypathBase,

    getBoolean(node: unknown, path: string) {
        const value = thorYPath.get(node, path);

        return convertToBoolean(value);
    },

    getNumber<T extends number | undefined>(node: any, path: string, defaultValue?: T) {
        try {
            return ypathBase.getNumberBase(node, path, defaultValue);
        } catch (e) {
            throw appendInnerErrors(e, {
                message: `getNumber: failed to convert field with path: "${path}".`,
            });
        }
    },

    /** @deprecated */
    getNumberDeprecated(node: unknown, path: string, defaultValue?: number) {
        try {
            const value = thorYPath.get(node, path);
            return convertToNumberOld(value, defaultValue);
        } catch (e) {
            throw appendInnerErrors(e, {
                message: `thorYPath.getNumber: failed to convert field with path: "${path}".`,
            });
        }
    },
};

export {convertToNumber} from './ypath-base';

export default thorYPath;
