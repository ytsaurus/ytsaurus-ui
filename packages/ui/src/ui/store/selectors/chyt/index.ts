import {createSelector} from 'reselect';
import uniq_ from 'lodash/uniq';
import compact_ from 'lodash/compact';

import {concatByAnd} from '../../../common/hammer/predicate';

import {RootState} from '../../../store/reducers';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {SortState} from '../../../types';
import {multiSortBySortStateArray} from '../../../utils/sort-helpers';
import {ChytListAttributes} from '../../../utils/api';
import {getSettingsData} from '../settings-base';

export const getChytListData = (state: RootState) => state.chyt.list.data;

export const getChytListAvailableCreators = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return uniq_(items.map((item) => item.creator!)).sort();
});

export const getChytListAvailableHealths = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return compact_(uniq_(items.map((item) => item.health)).sort());
});

export const getChytListAvailableStates = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return uniq_(items.map((item) => item.state!)).sort();
});

export const getChytCurrentAlias = (state: RootState) => state.chyt.clique.currentClique;

export const getChytListFilterAlias = (state: RootState) => state.chyt.listFilters.name;
export const getChytListFilterHealth = (state: RootState) => state.chyt.listFilters.health;
export const getChytListFilterCreator = (state: RootState) => state.chyt.listFilters.creator;
export const getChytListFilterState = (state: RootState) => state.chyt.listFilters.state;

type ChytListColumns = Exclude<ChytListAttributes, 'yt_operation_id'>;
const CHYT_LIST_SELECTABLE_COLUMNS: Record<Exclude<ChytListColumns, 'health_reason'>, true> = {
    instance_count: true,
    total_cpu: true,
    total_memory: true,
    creation_time: true,
    stage: true,
    yt_operation_start_time: true,
    yt_operation_finish_time: true,
    speclet_modification_time: true,
    strawberry_state_modification_time: true,
    pool: true,
    health: true,
    creator: true,
    state: true,
};

export type ChytSelectableColumn = keyof typeof CHYT_LIST_SELECTABLE_COLUMNS;

type ChytColumnItem = {checked: boolean; column: ChytListColumns};

export const getChytListColumnsFromSettings = (state: RootState) => {
    return (
        getSettingsData(state)['global::chyt::list_columns'] ??
        ([
            'health',
            'state',
            'instance_count',
            'total_cpu',
            'total_memory',
            'creator',
            'creation_time',
        ] as const)
    );
};

export const getChytListVisibleColumns = createSelector(
    [getChytListColumnsFromSettings],
    (columns): Array<ChytSelectableColumn> => {
        const userColumns = new Set(columns);
        return compact_(
            columns.map((k) => {
                return CHYT_LIST_SELECTABLE_COLUMNS[
                    k as keyof typeof CHYT_LIST_SELECTABLE_COLUMNS
                ] && userColumns.has(k)
                    ? (k as ChytSelectableColumn)
                    : null;
            }),
        );
    },
);

export const getChytListColumns = createSelector(
    [getChytListVisibleColumns],
    (columns): Array<ChytColumnItem> => {
        const userColumns = new Set(columns);
        const res = columns.map((column) => {
            return {checked: true, column};
        });

        Object.keys(CHYT_LIST_SELECTABLE_COLUMNS).forEach((k) => {
            const column = k as ChytSelectableColumn;
            if (!userColumns.has(column)) {
                res.push({checked: false, column});
            }
        });

        return res;
    },
);

export const getChytListTableSortState = (state: RootState) => state.chyt.listFilters.sortState;

export const getChytListTableSortStateByName = createSelector(
    [getChytListTableSortState],
    (sortState) => {
        return sortState.reduce((acc, item, index) => {
            if (item.column) {
                acc[item.column] = {
                    ...item,
                    multisortIndex: sortState.length > 1 ? index + 1 : undefined,
                };
            }
            return acc;
        }, {} as Record<keyof ChytInfo, SortState<keyof ChytInfo> & {multisortIndex?: number}>);
    },
);

const getChytFilterPredicate = createSelector(
    [
        getChytListFilterAlias,
        getChytListFilterCreator,
        getChytListFilterState,
        getChytListFilterHealth,
    ],
    (alias, creator, state, health) => {
        const predicates = compact_([
            alias ? (item: ChytInfo) => -1 !== item.alias.indexOf(alias) : undefined,
            creator !== undefined ? (item: ChytInfo) => creator === item.creator : undefined,
            state ? (item: ChytInfo) => state === item.state : undefined,
            health ? (item: ChytInfo) => health === item.health : undefined,
        ]);

        return predicates.length ? concatByAnd(...predicates) : undefined;
    },
);

export const getChytListTableItems = createSelector(
    [getChytListData, getChytListTableSortState, getChytFilterPredicate],
    (data, sortState, predicate) => {
        const {items = []} = data;

        const filteredItems = !predicate ? items : items.filter(predicate);

        const sortedItems = multiSortBySortStateArray(filteredItems, sortState);

        return sortedItems;
    },
);
