import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import compact from 'lodash/compact';

import {QueriesListAuthorFilter} from '../../module/queries_list/types';
import {AVAILABLE_COLUMNS} from './index';
import {setSettingByKey} from '../../../../store/actions/settings';
import {getQueryListHistoryColumns} from '../../module/queries_list/selectors';

export const useQueryHistoryListColumns = ({type}: {type?: QueriesListAuthorFilter}) => {
    const dispatch = useDispatch();
    const selectedColumns = useSelector(getQueryListHistoryColumns);

    return React.useMemo(() => {
        return {
            columns: compact(
                selectedColumns.map((i) => {
                    const allowColumn = type !== QueriesListAuthorFilter.My || i !== 'Author';
                    return allowColumn ? AVAILABLE_COLUMNS[i] : undefined;
                }),
            ),
            allColumns: Object.keys(AVAILABLE_COLUMNS),
            handleColumnChange: (value: {items: Array<{checked: boolean; name: string}>}) => {
                dispatch(
                    setSettingByKey(
                        `global::queryTracker::history::Columns`,
                        value.items.filter(({checked}) => checked).map(({name}) => name),
                    ),
                );
            },
        };
    }, [type, selectedColumns, dispatch]);
};
