import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import unipika from '@gravity-ui/unipika/lib/unipika';
import {appendInnerErrors} from '../../utils/errors';

const yson = unipika.utils.yson;

function convertToBoolean(value) {
    value = yson.value(value);

    const type = unipika.utils.type(value);

    if (type === 'string' && (value === 'true' || value === 'false')) {
        return value === 'true';
    } else if (type === 'boolean' || type === 'undefined') {
        return value;
    } else {
        throw new Error('thorYPath: value cannot be converted to boolean.');
    }
}

function convertToNumber(value, defaultValue) {
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
        return isNaN(value) && defaultValue !== undefined ? defaultValue : value;
    } else {
        if (defaultValue !== undefined) {
            return isNaN(defaultValue) ? undefined : defaultValue;
        }
        throw new Error('thorYPath: value "' + value + '" cannot be converted to number.');
    }
}

// Simple wrapper for ypath that unwraps observables passed to ypath methods
const thorYPath = {...ypath};

thorYPath.get = function (node, path) {
    if (typeof path === 'undefined') {
        return node;
    } else {
        return ypath.get(node, path);
    }
};

thorYPath.getAttributes = function (node, path) {
    return yson.attributes(thorYPath.get(node, path));
};

thorYPath.getValue = function (node, path) {
    return yson.value(thorYPath.get(node, path));
};

thorYPath.getValues = function (node, paths) {
    return ypath.getValues(node, paths);
};

thorYPath.getBoolean = function (node, path) {
    const value = thorYPath.get(node, path);

    return convertToBoolean(value);
};

/**
 * @param node
 * @param path
 * @param defaultValue Number or NaN to return undefined for unparsable values instead of throwing an error
 * @returns {number|*}
 */
thorYPath.getNumber = function (node, path, defaultValue) {
    try {
        const value = thorYPath.get(node, path);
        return convertToNumber(value, defaultValue);
    } catch (e) {
        throw appendInnerErrors(e, {
            message: `thorYPath.getNumber: failed to convert field with path: "${path}".`,
        });
    }
};

export default thorYPath;
