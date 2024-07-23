import each_ from 'lodash/each';
import extend_ from 'lodash/extend';
import isFunction_ from 'lodash/isFunction';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {compareVectors, compareWithUndefined} from '../../utils/sort-helpers';
import hammer from '@ytsaurus/interface-helpers/lib/hammer';

export const utils = hammer.utils;

/**
 * Converts objects to arrays
 * @param {Object} input
 * @param {String} keyName
 * @param {String} valueName
 * @returns {Array}
 */
utils.objectToArray = function (input, keyName, valueName) {
    const output = [];

    for (const key in input) {
        if (Object.hasOwnProperty.call(input, key)) {
            let item = {};

            if (valueName) {
                item[valueName] = input[key];
            } else {
                item = extend_(item, input[key]);
            }

            if (keyName) {
                item[keyName] = key;
            }
            output.push(item);
        }
    }
    return output;
};

/**
 * In-place sort (ascending order) with some order predefined (other items are sorted according to their type)
 * @param {Array} predefinedOrder - array of predefined order values, e.g. ['foo', 'bar']
 * @param {Array} list - array of items
 * @param {String} [property] - optional value getter, if omitted whole item is considered as value
 * @returns {Array}
 */
utils.sortInPredefinedOrder = function (predefinedOrder, list, property) {
    list.sort((itemA, itemB) => {
        const itemAValue = property ? itemA[property] : itemA;
        const itemBValue = property ? itemB[property] : itemB;

        const predifinedAIndex = predefinedOrder.indexOf(itemAValue);
        const predifinedBIndex = predefinedOrder.indexOf(itemBValue);

        if (predifinedAIndex === -1 && predifinedBIndex === -1) {
            return itemAValue > itemBValue ? 1 : -1;
        } else if (predifinedAIndex === -1) {
            return 1;
        } else if (predifinedBIndex === -1) {
            return -1;
        } else {
            return predifinedAIndex > predifinedBIndex ? 1 : -1;
        }
    });

    return list;
};

function getSelectorFromField(field) {
    return field.sort && isFunction_(field.sort) ? field.sort : field.get;
}

function prepareFieldSelectors(fields) {
    const fieldSelectors = {};

    each_(fields, (field, fieldKey) => {
        const isGroupField = field.group;

        if (isGroupField) {
            const groupFields = field.items;

            each_(groupFields, (groupField, groupFieldKey) => {
                const actualFieldKey = fieldKey + '_' + groupFieldKey;

                fieldSelectors[actualFieldKey] = getSelectorFromField(groupField);
            });
        } else {
            fieldSelectors[fieldKey] = getSelectorFromField(field);
        }
    });

    return fieldSelectors;
}

function wrapCompareFnByAsc(compareFn, asc, undefinedAsk = true) {
    const orderK = asc ? 1 : -1;
    const undefinedOrderK = undefinedAsk ? 1 : -1;

    return (l, r) => compareFn(l, r, orderK, undefinedOrderK);
}

utils.sort = function (data, sortInfo, fields, options) {
    options = options || {};

    const unwrappedSortInfo = sortInfo;
    const unwrappedData = data;
    const fieldSelectors = prepareFieldSelectors(fields);

    if (!unwrappedSortInfo || !unwrappedData) {
        return unwrappedData;
    }

    const {field, asc, undefinedAsc} = unwrappedSortInfo;
    const fieldData = (fields || {})[field];
    const fieldSelector = fieldSelectors[field];
    const groupBy = options.groupBy,
        addGetParams = options.addGetParams || [];

    const compareFn =
        fieldData?.compareFn ||
        (fieldData?.sortWithUndefined ? compareWithUndefined : compareVectors);
    const cmp = wrapCompareFnByAsc(compareFn, asc, undefinedAsc);

    if (fieldSelector) {
        let result = unwrappedData;
        result = result.slice(0).sort((left, right) => {
            const compareResult = cmp(
                fieldSelector(left, ...addGetParams),
                fieldSelector(right, ...addGetParams),
                asc,
                undefinedAsc,
            );

            if (groupBy) {
                const groupByCompareResult = utils.compareVectors(
                    groupBy.get(left, ...addGetParams),
                    groupBy.get(right, ...addGetParams),
                    groupBy.asc ? 'asc' : 'desc',
                );

                if (groupByCompareResult !== 0) {
                    return groupByCompareResult;
                }
            }

            return compareResult;
        });
        return result;
    }

    return unwrappedData;
};

utils.getSortByFieldAction = function (sortInfo, fieldName) {
    if (fieldName === null && fieldName === undefined) {
        return null;
    } else {
        return {
            field: fieldName,
            asc: sortInfo && sortInfo.field === fieldName ? !sortInfo.asc : true,
        };
    }
};

/**
 * Computes state for any page
 * @param {String} page
 * @param {Object} [parameters]
 */
utils.getState = function (page, parameters) {
    const state = {page: page};

    extend_(state, parameters);

    return state;
};

/**
 * Computes state for navigation page
 * @param {String} path path in cypress
 * @param {String} [transaction] transaction id
 * @returns {Object}
 */
utils.getNavigationState = function (path, transaction) {
    const parameters = {path: path};

    if (transaction) {
        parameters.t = transaction;
    }

    return utils.getState('navigation', parameters);
};

/**
 * camelCases property name
 * @param {String} property property name string e.g. creation_time
 * @param {String} delimiter _ - considered default delimeter
 * @returns {String}
 */
// TODO move to hammer format
utils.toCamelCase = function (property, delimiter) {
    let camelCaseProperty = property.split(delimiter || '_');

    camelCaseProperty = map_(camelCaseProperty, (item) => {
        return item.charAt(0).toUpperCase() + item.slice(1);
    });

    camelCaseProperty = camelCaseProperty.join('');

    return camelCaseProperty;
};
// TODO move to hammer format
utils.toLowerCamelCase = function (property, delimiter) {
    const camelCaseProperty = utils.toCamelCase(property, delimiter);

    return camelCaseProperty.charAt(0).toLowerCase() + camelCaseProperty.slice(1);
};

utils.toArray = function (value) {
    return hammer.type.isArray(value) ? value : [value];
};

utils.sumArray = function (value) {
    return reduce_(
        value,
        (total, summand) => {
            return total + summand;
        },
        0,
    );
};

utils.mapToYSONList = function (map) {
    return map_(map, (attributes, value) => {
        return {
            $value: value,
            $attributes: attributes,
        };
    });
};

utils.listToYSONList = function (list, property) {
    return map_(list, (attributes) => {
        const value = attributes[property];
        return {
            $value: value,
            $attributes: attributes,
        };
    });
};

utils.extractFirstByte = function (id) {
    const idParts = id.split('-');
    const idLastPart = idParts[idParts.length - 1];
    const firstByte = Number.parseInt(idLastPart, 16) % 256;
    const strByte = firstByte.toString(16);
    return hammer.format['StrPad'](strByte, '0', 2);
};
