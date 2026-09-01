import each_ from 'lodash/each';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

function aggregateSimple(draftAggregation, item, name, type) {
    switch (type) {
        case 'sum':
            draftAggregation[name] = draftAggregation[name] || 0;
            if (typeof item[name] === 'number') {
                draftAggregation[name] += item[name];
            }
            break;

        case 'max':
            draftAggregation[name] = draftAggregation[name] || -Infinity;
            if (typeof item[name] === 'number') {
                draftAggregation[name] = Math.max(draftAggregation[name], item[name]);
            }
            break;

        case 'min':
            draftAggregation[name] = draftAggregation[name] || Infinity;
            if (typeof item[name] === 'number') {
                draftAggregation[name] = Math.min(draftAggregation[name], item[name]);
            }
            break;

        case 'concat-array':
            draftAggregation[name] = draftAggregation[name] || [];
            if (Array.isArray(item[name])) {
                draftAggregation[name] = draftAggregation[name].concat(item[name]);
            }
            break;

        case 'concat-string':
            draftAggregation[name] = draftAggregation[name] || '';
            if (typeof item[name] === 'string') {
                draftAggregation[name] += item[name];
            }
            break;

        case 'count':
            draftAggregation[name] = draftAggregation[name] || 0;
            draftAggregation[name]++;
            break;

        default:
            throw new Error('aggregation.prepare: unknown aggregation type "' + type + '"');
    }
}

function aggregateNested(draftAggregation, item, parts, type) {
    let name;
    if (parts.length > 1) {
        name = parts.shift();
        draftAggregation[name] = draftAggregation[name] || {};
        aggregateNested(draftAggregation[name], item[name], parts.slice(), type);
    } else {
        name = parts[0];
        aggregateSimple(draftAggregation, item, name, type);
    }
}

function aggregate(draftAggregation, item, property, lastItem) {
    const name = property.name;
    const type = property.type;

    if (typeof type === 'function') {
        type(draftAggregation, item, name, lastItem);
    } else if (type.startsWith('nested/')) {
        aggregateNested(draftAggregation, item, name.split('.'), type.slice('nested/'.length));
    } else {
        aggregateSimple(draftAggregation, item, name, type);
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
        map_(prepared.byProperty, function (draftValue, name) {
            draftValue[byProperty] = name;
            return draftValue;
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
