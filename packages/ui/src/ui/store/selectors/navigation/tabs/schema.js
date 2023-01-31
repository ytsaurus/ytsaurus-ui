import _ from 'lodash';
import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {getAttributes} from '../../../../store/selectors/navigation';

const TABLE_ATTRIBUTES_FOR_META = ['schema_mode'];
const EXCLUDED_COLUMNS = {sort_order: null};

const getColumn = (state) => state.navigation.tabs.schema.column;

export const getSchemaMeta = createSelector([getAttributes], (attributes) => {
    const schemaAttributes = ypath.getValue(attributes, '/schema/@');
    const tableAttributes = _.pick(attributes, TABLE_ATTRIBUTES_FOR_META);

    const tableMeta = _.map(tableAttributes, (value, key) => ({value, key}));
    const schemaMeta = _.map(schemaAttributes, (value, key) => ({
        value,
        key,
    }));

    return [...tableMeta, ...schemaMeta];
});

export const getSchema = createSelector([getAttributes], (attributes) => {
    const schemaValues = ypath.getValue(attributes.schema);

    return _.map(schemaValues, (item, index) => ({...item, index}));
});

export const getSchemaByName = createSelector([getSchema], (items) => {
    return _.reduce(
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
    const items = _.reduce(
        schema,
        (res, schemaEntry) => {
            _.each(schemaEntry, (columnValue, columnName) => {
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

    _.each(items, (columnConfig, columnName) => {
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
