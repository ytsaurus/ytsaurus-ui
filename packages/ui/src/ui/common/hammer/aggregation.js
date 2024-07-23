import each_ from 'lodash/each';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

function aggregateSimple(aggregation, item, name, type) {
    switch (type) {
        case 'sum':
            aggregation[name] = aggregation[name] || 0;
            if (typeof item[name] === 'number') {
                aggregation[name] += item[name];
            }
            break;

        case 'max':
            aggregation[name] = aggregation[name] || -Infinity;
            if (typeof item[name] === 'number') {
                aggregation[name] = Math.max(aggregation[name], item[name]);
            }
            break;

        case 'min':
            aggregation[name] = aggregation[name] || Infinity;
            if (typeof item[name] === 'number') {
                aggregation[name] = Math.min(aggregation[name], item[name]);
            }
            break;

        case 'concat-array':
            aggregation[name] = aggregation[name] || [];
            if (Array.isArray(item[name])) {
                aggregation[name] = aggregation[name].concat(item[name]);
            }
            break;

        case 'concat-string':
            aggregation[name] = aggregation[name] || '';
            if (typeof item[name] === 'string') {
                aggregation[name] += item[name];
            }
            break;

        case 'count':
            aggregation[name] = aggregation[name] || 0;
            aggregation[name]++;
            break;

        default:
            throw new Error('aggregation.prepare: unknown aggregation type "' + type + '"');
    }
}

function aggregateNested(aggregation, item, parts, type) {
    let name;
    if (parts.length > 1) {
        name = parts.shift();
        aggregation[name] = aggregation[name] || {};
        aggregateNested(aggregation[name], item[name], parts.slice(), type);
    } else {
        name = parts[0];
        aggregateSimple(aggregation, item, name, type);
    }
}

function aggregate(aggregation, item, property, lastItem) {
    const name = property.name;
    const type = property.type;

    if (typeof type === 'function') {
        type(aggregation, item, name, lastItem);
    } else if (type.startsWith('nested/')) {
        aggregateNested(aggregation, item, name.split('.'), type.slice('nested/'.length));
    } else {
        aggregateSimple(aggregation, item, name, type);
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
        function (aggregation, item, index) {
            const lastItem = index === items.length - 1;

            each_(properties, function (property) {
                aggregate(aggregation.total, item, property, lastItem);

                if (byProperty) {
                    const aggregateByValue = item[byProperty];
                    aggregation.byProperty[aggregateByValue] =
                        aggregation.byProperty[aggregateByValue] || {};
                    aggregate(aggregation.byProperty[aggregateByValue], item, property, lastItem);
                }
            });

            return aggregation;
        },
        {total: {}, byProperty: {}},
    );

    prepared = [prepared.total].concat(
        map_(prepared.byProperty, function (value, name) {
            value[byProperty] = name;
            return value;
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
        function (result, item) {
            if (Object.hasOwnProperty.call(result, item[key])) {
                result[item[key]]++;
            } else if (Object.hasOwnProperty.call(item, key)) {
                result[item[key]] = 1;
            }
            return result;
        },
        initialResult,
    );
}
