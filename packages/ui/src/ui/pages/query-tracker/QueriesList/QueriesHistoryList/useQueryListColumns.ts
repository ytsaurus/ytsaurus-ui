import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import intersectionBy_ from 'lodash/intersectionBy';
import {QueriesListAuthorFilter} from '../../module/queries_list/types';
import {AllColumns, AuthorColumns, MyColumns, NameColumns} from './index';
import {setSettingByKey} from '../../../../store/actions/settings';
import {getQueryListHistoryColumns} from '../../module/queries_list/selectors';

export const useQueryHistoryListColumns = ({type}: {type?: QueriesListAuthorFilter}) => {
    const dispatch = useDispatch();
    const selectedColumns = useSelector(getQueryListHistoryColumns);

    const handleColumnChange = (selectedColumns: {
        items: Array<{checked: boolean; name: string}>;
    }) => {
        dispatch(
            setSettingByKey(
                `global::queryTracker::history::Columns`,
                selectedColumns.items.filter(({checked}) => checked).map(({name}) => name),
            ),
        );
    };

    return React.useMemo(() => {
        const ALL_COLUMN_NAMES = intersectionBy_(AllColumns, MyColumns, 'name').map(
            (item) => item.name,
        );
        const EXCLUDED_COLUMNS = [NameColumns.name, AuthorColumns.name];
        const currentColumnsPreset = type === QueriesListAuthorFilter.My ? MyColumns : AllColumns;

        const selectedColumnNames = new Set(
            Array.isArray(selectedColumns) ? selectedColumns : ALL_COLUMN_NAMES,
        );

        selectedColumnNames.add(NameColumns.name);
        selectedColumnNames.add(AuthorColumns.name);

        return {
            columns: currentColumnsPreset.filter(({name}) => selectedColumnNames.has(name)),
            allowedColumns: currentColumnsPreset
                .filter((item) => !EXCLUDED_COLUMNS.includes(item.name))
                .map(({name}) => ({name, checked: selectedColumnNames.has(name)})),
            handleColumnChange,
        };
    }, [type, selectedColumns]);
};
