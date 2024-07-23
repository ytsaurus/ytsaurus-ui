import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import pick_ from 'lodash/pick';
import reduce_ from 'lodash/reduce';

import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {getAttributes} from '../../../../store/selectors/navigation';

const TABLE_ATTRIBUTES_FOR_META = ['schema_mode'];
const EXCLUDED_COLUMNS = {sort_order: null};

const getColumn = (state) => state.navigation.tabs.schema.column;

export const getSchemaMeta = createSelector([getAttributes], (attributes) => {
    const schemaAttributes = ypath.getValue(attributes, '/schema/@');
    const tableAttributes = pick_(attributes, TABLE_ATTRIBUTES_FOR_META);

    const tableMeta = map_(tableAttributes, (value, key) => ({value, key}));
    const schemaMeta = map_(schemaAttributes, (value, key) => ({
        value,
        key,
    }));

    return [...tableMeta, ...schemaMeta];
});

export const getSchema = createSelector([getAttributes], (attributes) => {
    const schemaValues = ypath.getValue(attributes.schema);

    return map_(schemaValues, (item, index) => ({...item, index}));
});

export const getSchemaByName = createSelector([getSchema], (items) => {
    return reduce_(
        items,
        (acc, item) => {
            acc[item.name] = item;
            return acc;
        },
        {},
    );
});

export const getSchemaStrict = createSelector([getAttributes], (attrs) => {
    return ypath.getValue(attrs, '/schema/@strict');
});

export const getFilteredSchema = createSelector([getSchema, getColumn], (data, input) =>
    hammer.filter.filter({data, input, factors: ['type', 'name']}),
);

export const getComputedColumns = createSelector([getSchema], (schema) => {
    const items = reduce_(
        schema,
        (res, schemaEntry) => {
            forEach_(schemaEntry, (columnValue, columnName) => {
                res[columnName] = res[columnName] || {
                    caption: columnName === 'index' ? '#' : undefined,
                    sort: false,
                    align: 'left',
                };
            });
            return res;
        },
        {},
    );

    let set = [];

    forEach_(items, (columnConfig, columnName) => {
        if (!Object.hasOwnProperty.call(EXCLUDED_COLUMNS, columnName)) {
            set.push(columnName);
        }
    });

    set = hammer.utils.sortInPredefinedOrder(['index', 'type', 'name'], set);

    return {
        set: set,
        items: items,
    };
});
