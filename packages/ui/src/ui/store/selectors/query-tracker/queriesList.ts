import {createSelector} from 'reselect';
import {type RootState} from '../../reducers';
import {selectCurrentUserName} from '../global';
import {type QueriesListParams, type QueryItem} from '../../../types/query-tracker/api';
import {isQueryProgress} from '../../../pages/query-tracker/utils/query';
import {
    DefaultQueriesListFilter,
    QueriesListAuthorFilter,
    QueriesListFilterPresets,
    QueriesListMode,
} from '../../../types/query-tracker/queryList';
import {getSettingsData} from '../settings/settings-base';
import {selectIsVcsVisible} from './vcs';
import groupBy_ from 'lodash/groupBy';
import moment from 'moment';
import intersectionBy_ from 'lodash/intersectionBy';
import {
    ActionColumns,
    AllColumns,
    AuthorColumns,
    MyColumns,
    NameColumns,
} from '../../../pages/query-tracker/QueriesList/QueriesHistoryList/columns';
import {selectIsSupportedTutorials} from './queryAco';

export const selectQueriesListState = (state: RootState) => state.queryTracker.list;

export const selectIsQueriesListLoading = (state: RootState) => state.queryTracker.list.isLoading;

export const selectQueriesList = (state: RootState) => selectQueriesListState(state).items;

export const selectHasQueriesListMore = (state: RootState) =>
    selectQueriesListState(state).hasMore;

export const selectQueriesFilters = (state: RootState) =>
    selectQueriesListState(state).filter || {};
export const selectQueriesListMode = (state: RootState) =>
    selectQueriesListState(state).listMode;
export const selectQueriesListCursor = (state: RootState) =>
    selectQueriesListState(state).cursor;

export const selectTutorialQueriesList = createSelector(
    [selectQueriesList, selectIsSupportedTutorials],
    (listItems, supportsTutorials) => {
        return listItems.filter((item) =>
            supportsTutorials ? item?.is_tutorial : item?.annotations?.is_tutorial,
        );
    },
);

export const selectQueryListByDate = createSelector([selectQueriesList], (listItems) => {
    return Object.entries(
        groupBy_(listItems, (item) => moment(item.start_time).format('DD MMMM YYYY')),
    ).reduce<(QueryItem | {header: string})[]>((ret, [header, items]) => {
        ret.push({
            header,
        });

        return ret.concat(items.map((item) => item));
    }, []);
});

export const selectQueriesListTabs = createSelector([selectIsVcsVisible], (vcsVisible) => {
    const queriesListMode = Object.values(QueriesListMode);
    return vcsVisible
        ? queriesListMode
        : queriesListMode.filter((item) => item !== QueriesListMode.VCS);
});

export const selectQueryListColumns = createSelector(
    [selectQueriesFilters, selectQueryListHistoryColumns],
    (filter, selectedColumns) => {
        const ALL_COLUMN_NAMES = intersectionBy_(AllColumns, MyColumns, 'name').map(
            (item) => item.name,
        );
        const EXCLUDED_COLUMNS = [NameColumns.name, AuthorColumns.name, ActionColumns.name];
        const currentColumnsPreset =
            filter.user === QueriesListAuthorFilter.My ? MyColumns : AllColumns;

        const selectedColumnNames = new Set(
            Array.isArray(selectedColumns) ? selectedColumns : ALL_COLUMN_NAMES,
        );

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

export const selectHasCustomHistoryFilters = createSelector(
    [selectQueriesFilters, getSettingsData],
    (filter) => {
        const {from, to, state, user} = filter;
        const defaultFilter = DefaultQueriesListFilter[QueriesListMode.History];

        const fromChanged = from !== undefined;
        const toChanged = to !== undefined;
        const stateChanged = state !== undefined;
        const userChanged = user !== defaultFilter.user;

        return fromChanged || toChanged || stateChanged || userChanged;
    },
);

export const selectUncompletedItems = createSelector(selectQueriesList, (items) => {
    return items.filter(isQueryProgress);
});

export const selectQueriesListCursorParams = (state: RootState) => {
    const cursor = selectQueriesListCursor(state);
    if (cursor) {
        return {cursor_time: cursor.cursorTime, cursor_direction: cursor.direction};
    }

    return undefined;
};

export function selectQueriesListFilterParams(state: RootState): QueriesListParams {
    const listMode = selectQueriesListMode(state);
    const filterParams = {
        ...selectQueriesFilters(state),
        ...(QueriesListFilterPresets[listMode] || {}),
    };
    const {is_tutorial, from, to, state: queryState, ...filter} = filterParams;

    let user = filter.user;
    if (filter.user === 'my') {
        user = selectCurrentUserName(state);
    }
    if (filter.user === 'all') {
        user = undefined;
    }

    const supportsTutorials = selectIsSupportedTutorials(state);

    const params: QueriesListParams = {
        ...filter,
        from_time: from,
        to_time: to,
        state: queryState,
        user,
    };

    if (is_tutorial) {
        if (supportsTutorials) {
            params.tutorial_filter = true;
        } else {
            params.filter = 'is_tutorial';
        }
    }

    return params;
}

export function selectQueryListHistoryColumns(state: RootState) {
    return getSettingsData(state)['global::queryTracker::history::Columns'];
}
