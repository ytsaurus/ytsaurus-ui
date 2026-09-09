// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import unipika from './unipika';
import {appendInnerErrors} from '../../utils/errors';

const yson = unipika.utils.yson;

/** @deprecated */
function convertToNumberOld(value: number | string, defaultValue?: number): number | undefined {
    const currentValue: unknown = yson.value(value);

    const type = unipika.utils.type(currentValue);

    if (type === 'string') {
        const converted = Number(currentValue);

        if (isFinite(converted)) {
            return converted;
        } else {
            if (defaultValue !== undefined) {
                return isNaN(defaultValue) ? undefined : defaultValue;
            }
            throw new Error(
                'thorYPath: value "' + currentValue + '" cannot be converted to number.',
            );
        }
    } else if (type === 'number' || type === 'undefined') {
        return isNaN(currentValue as number) && defaultValue !== undefined
            ? defaultValue
            : (currentValue as number | undefined);
    } else {
        if (defaultValue !== undefined) {
            return isNaN(defaultValue) ? undefined : defaultValue;
        }
        throw new Error('thorYPath: value "' + currentValue + '" cannot be converted to number.');
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
