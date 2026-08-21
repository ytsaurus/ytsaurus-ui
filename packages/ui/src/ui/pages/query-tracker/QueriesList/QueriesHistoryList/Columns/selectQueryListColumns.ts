import {createSelector} from 'reselect';
import intersectionBy_ from 'lodash/intersectionBy';
import {QueriesListAuthorFilter} from '../../../../../types/query-tracker/queryList';
import {
    selectQueriesFilters,
    selectQueryListHistoryColumns,
} from '../../../../../store/selectors/query-tracker/queriesList';
import {ActionColumns, AllColumns, AuthorColumns, MyColumns, NameColumns} from './columns';

const ALL_COLUMN_NAMES = intersectionBy_(AllColumns, MyColumns, 'name').map((item) => item.name);
const EXCLUDED_COLUMNS = [NameColumns.name, AuthorColumns.name, ActionColumns.name];

export const selectQueryListColumns = createSelector(
    [selectQueriesFilters, selectQueryListHistoryColumns],
    (filter, selectedColumns) => {
        const currentColumnsPreset =
            filter.user === QueriesListAuthorFilter.My ? MyColumns : AllColumns;

        const selectedColumnNames = new Set(selectedColumns ?? ALL_COLUMN_NAMES);

        selectedColumnNames.add(NameColumns.name);
        selectedColumnNames.add(AuthorColumns.name);
        selectedColumnNames.add(ActionColumns.name);

        return {
            columns: currentColumnsPreset.filter(({name}) => selectedColumnNames.has(name)),
            allowedColumns: currentColumnsPreset
                .filter((item) => !EXCLUDED_COLUMNS.includes(item.name))
                .map(({name}) => ({name, checked: selectedColumnNames.has(name)})),
        };
    },
);
