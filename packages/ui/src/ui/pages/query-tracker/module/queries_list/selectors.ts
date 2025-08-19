import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {getCurrentUserName} from '../../../../store/selectors/global';
import {QueriesListParams, QueryItem} from '../api';
import {isQueryProgress} from '../../utils/query';
import {
    DefaultQueriesListFilter,
    QueriesListAuthorFilter,
    QueriesListFilterPresets,
    QueriesListMode,
} from './types';
import {getSettingsData} from '../../../../store/selectors/settings/settings-base';
import {selectIsVcsVisible} from '../vcs/selectors';
import groupBy_ from 'lodash/groupBy';
import moment from 'moment';
import intersectionBy_ from 'lodash/intersectionBy';
import {
    ActionColumns,
    AllColumns,
    AuthorColumns,
    MyColumns,
    NameColumns,
} from '../../QueriesList/QueriesHistoryList/columns';

export const getQueriesListState = (state: RootState) => state.queryTracker.list;

export const isQueriesListLoading = (state: RootState) => state.queryTracker.list.isLoading;

export const getQueriesList = (state: RootState) => getQueriesListState(state).items;

export const hasQueriesListMore = (state: RootState) => getQueriesListState(state).hasMore;

export const getQueriesFilters = (state: RootState) => getQueriesListState(state).filter || {};
export const getQueriesListMode = (state: RootState) => getQueriesListState(state).listMode;
export const getQueriesListCursor = (state: RootState) => getQueriesListState(state).cursor;

export const getQueryListByDate = createSelector([getQueriesList], (listItems) => {
    return Object.entries(
        groupBy_(listItems, (item) => moment(item.start_time).format('DD MMMM YYYY')),
    ).reduce<(QueryItem | {header: string})[]>((ret, [header, items]) => {
        ret.push({
            header,
        });

        return ret.concat(items.map((item) => item));
    }, []);
});

export const getQueriesListTabs = createSelector([selectIsVcsVisible], (vcsVisible) => {
    const queriesListMode = Object.values(QueriesListMode);
    return vcsVisible
        ? queriesListMode
        : queriesListMode.filter((item) => item !== QueriesListMode.VCS);
});

export const getQueryListColumns = createSelector(
    [getQueriesFilters, getQueryListHistoryColumns],
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

export const hasCustomHistoryFilters = createSelector(
    [getQueriesFilters, getSettingsData],
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

export const getUncompletedItems = createSelector(getQueriesList, (items) => {
    return items.filter(isQueryProgress);
});

export const getQueriesListCursorParams = (state: RootState) => {
    const cursor = getQueriesListCursor(state);
    if (cursor) {
        return {cursor_time: cursor.cursorTime, cursor_direction: cursor.direction};
    }

    return undefined;
};

export function getQueriesListFilterParams(state: RootState): QueriesListParams {
    const listMode = getQueriesListMode(state);
    const filterParams = {
        ...getQueriesFilters(state),
        ...(QueriesListFilterPresets[listMode] || {}),
    };
    const {is_tutorial, from, to, state: queryState, ...filter} = filterParams;

    let user = filter.user;
    if (filter.user === 'my') {
        user = getCurrentUserName(state);
    }
    if (filter.user === 'all') {
        user = undefined;
    }

    const params = {
        ...filter,
        from_time: from,
        to_time: to,
        state: queryState ? queryState[0].toUpperCase() + queryState.slice(1) : undefined,
        user,
    };

    if (is_tutorial) {
        params.filter = `is_tutorial`;
    }
    return params;
}

export function getQueryListHistoryColumns(state: RootState) {
    return getSettingsData(state)['global::queryTracker::history::Columns'];
}
