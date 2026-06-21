import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {selectAttributes} from '../../../../store/selectors/navigation';
import i18n from './i18n';

const EXCLUDED_COLUMNS = {sort_order: null};

const selectColumn = (state) => state.navigation.tabs.schema.column;

export const selectSchemaMeta = createSelector([selectAttributes], (attributes) => {
    const schemaAttributes = ypath.getValue(attributes, '/schema/@');

    return [
        {key: 'schema_mode', label: i18n('field_schema-mode'), value: attributes.schema_mode},
        {key: 'strict', label: i18n('field_strict'), value: schemaAttributes.strict},
        {key: 'unique_keys', label: i18n('field_unique-keys'), value: schemaAttributes.unique_keys},
    ];
});

export const selectSchema = createSelector([selectAttributes], (attributes) => {
    const schemaValues = ypath.getValue(attributes.schema);

    return map_(schemaValues, (item, index) => ({...item, index}));
});

export const selectSchemaByName = createSelector([selectSchema], (items) => {
    return reduce_(
        items,
        (acc, item) => {
            acc[item.name] = item;
            return acc;
        },
        {},
    );
});

export const selectSchemaStrict = createSelector([selectAttributes], (attrs) => {
    return ypath.getValue(attrs, '/schema/@strict');
});

export const selectFilteredSchema = createSelector([selectSchema, selectColumn], (data, input) =>
    hammer.filter.filter({data, input, factors: ['type', 'name']}),
);

export const selectComputedColumns = createSelector([selectSchema], (schema) => {
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
        set,
        items,
    };
});
