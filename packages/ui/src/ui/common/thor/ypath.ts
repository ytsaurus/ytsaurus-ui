// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import unipika from './unipika';
import {appendInnerErrors} from '../../utils/errors';

const yson = unipika.utils.yson;

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

export default thorYPath;
