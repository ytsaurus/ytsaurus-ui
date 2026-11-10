import React from 'react';
import debounce_ from 'lodash/debounce';
import {type QueryListSearchConfig} from '@gravity-ui/querieskit';

import {applyFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import {setSearchMode} from '../../../../store/reducers/query-tracker/queryListSlice';

type SearchMode = 'name' | 'text';

export function useQueriesHistorySearch({
    active,
    value,
    searchMode,
    fullTextSearchSupported,
}: {
    active: boolean;
    value?: string;
    searchMode: SearchMode;
    fullTextSearchSupported: boolean;
}): QueryListSearchConfig {
    const dispatch = useDispatch();

    const applySearch = React.useCallback(
        ({value: nextValue, fullSearch}: {value: string; fullSearch: boolean}) => {
            dispatch(setSearchMode(fullSearch ? 'text' : 'name'));
            dispatch(applyFilter({filter: nextValue}));
        },
        [dispatch],
    );

    const applySearchDebounced = React.useMemo(() => debounce_(applySearch, 400), [applySearch]);

    React.useEffect(() => {
        if (!active) applySearchDebounced.cancel();
        return () => applySearchDebounced.cancel();
    }, [active, applySearchDebounced]);

    const handleSearchUpdate = React.useCallback(
        (search: {value: string; fullSearch: boolean}) => {
            const nextSearchMode: SearchMode = search.fullSearch ? 'text' : 'name';
            if (nextSearchMode !== searchMode) {
                applySearchDebounced.cancel();
                applySearch(search);
            } else {
                applySearchDebounced(search);
            }
        },
        [applySearch, applySearchDebounced, searchMode],
    );

    React.useEffect(() => {
        if (active && !fullTextSearchSupported && searchMode === 'text') {
            applySearch({value: value ?? '', fullSearch: false});
        }
    }, [active, applySearch, fullTextSearchSupported, searchMode, value]);

    return React.useMemo(
        () => ({
            value,
            fullSearch: searchMode === 'text',
            fullSearchAvailable: fullTextSearchSupported,
            hasClear: true,
            onUpdate: handleSearchUpdate,
        }),
        [fullTextSearchSupported, handleSearchUpdate, searchMode, value],
    );
}
