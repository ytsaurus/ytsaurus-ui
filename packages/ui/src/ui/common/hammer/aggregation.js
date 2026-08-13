import each_ from 'lodash/each';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

function aggregateSimple(accAggregation, item, name, type) {
    switch (type) {
        case 'sum':
            accAggregation[name] = accAggregation[name] || 0;
            if (typeof item[name] === 'number') {
                accAggregation[name] += item[name];
            }
            break;

        case 'max':
            accAggregation[name] = accAggregation[name] || -Infinity;
            if (typeof item[name] === 'number') {
                accAggregation[name] = Math.max(accAggregation[name], item[name]);
            }
            break;

        case 'min':
            accAggregation[name] = accAggregation[name] || Infinity;
            if (typeof item[name] === 'number') {
                accAggregation[name] = Math.min(accAggregation[name], item[name]);
            }
            break;

        case 'concat-array':
            accAggregation[name] = accAggregation[name] || [];
            if (Array.isArray(item[name])) {
                accAggregation[name] = accAggregation[name].concat(item[name]);
            }
            break;

        case 'concat-string':
            accAggregation[name] = accAggregation[name] || '';
            if (typeof item[name] === 'string') {
                accAggregation[name] += item[name];
            }
            break;

        case 'count':
            accAggregation[name] = accAggregation[name] || 0;
            accAggregation[name]++;
            break;

        default:
            throw new Error('aggregation.prepare: unknown aggregation type "' + type + '"');
    }
}

function aggregateNested(accAggregation, item, parts, type) {
    let name;
    if (parts.length > 1) {
        name = parts.shift();
        accAggregation[name] = accAggregation[name] || {};
        aggregateNested(accAggregation[name], item[name], parts.slice(), type);
    } else {
        name = parts[0];
        aggregateSimple(accAggregation, item, name, type);
    }
}

function aggregate(accAggregation, item, property, lastItem) {
    const name = property.name;
    const type = property.type;

    if (typeof type === 'function') {
        type(accAggregation, item, name, lastItem);
    } else if (type.startsWith('nested/')) {
        aggregateNested(accAggregation, item, name.split('.'), type.slice('nested/'.length));
    } else {
        aggregateSimple(accAggregation, item, name, type);
    }
}

/**
 * Prepare a list of aggregations,
 *  by default only total aggregation is prepared,
 *  passing a byProperty will produce extra aggregations,
 *  values that do not match aggregation type are ignored,
 *  use an additional property with 'count' aggregation type to count items in each aggregation
 * @param items {Array} - list of items
 * @param properties {Array} - list of properties and aggregation types e.g. [ { name: 'foo', type: 'sum' } ]
 * @param properties[i].type {Function|String} - aggregation type 'count', 'sum', 'min', 'max', 'concat-array', 'concat-string' or a custom function
 * @param properties[i].name {String} - property name, property values must be accessible via property name
 * @param [byProperty] {String}
 */
export function prepare(items, properties, byProperty) {
    let prepared = reduce_(
        items,
        function (accAggregation, item, index) {
            const lastItem = index === items.length - 1;

            each_(properties, function (property) {
                aggregate(accAggregation.total, item, property, lastItem);

                if (byProperty) {
                    const aggregateByValue = item[byProperty];
                    accAggregation.byProperty[aggregateByValue] =
                        accAggregation.byProperty[aggregateByValue] || {};
                    aggregate(
                        accAggregation.byProperty[aggregateByValue],
                        item,
                        property,
                        lastItem,
                    );
                }
            });

            return accAggregation;
        },
        {total: {}, byProperty: {}},
    );

    prepared = [prepared.total].concat(
        map_(prepared.byProperty, function (accValue, name) {
            accValue[byProperty] = name;
            return accValue;
        }),
    );

    return prepared;
}

/**
 * Count the number of keys in an array of objects,
 * @param items {Array} - list of items
 * @param key {String} - key to count values
 * @param initialResult {Object} - the initial object that will be merged with the result
 */
export function countValues(items, key, initialResult = {}) {
    return reduce_(
        items,
        function (accResult, item) {
            if (Object.hasOwnProperty.call(accResult, item[key])) {
                accResult[item[key]]++;
            } else if (Object.hasOwnProperty.call(item, key)) {
                accResult[item[key]] = 1;
            }
            return accResult;
        },
        initialResult,
    );
}
