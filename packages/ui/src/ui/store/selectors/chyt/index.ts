import {createSelector} from 'reselect';
import uniq_ from 'lodash/uniq';
import compact_ from 'lodash/compact';

import {concatByAnd} from '../../../common/hammer/predicate';

import {RootState} from '../../../store/reducers';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {SortState} from '../../../types';
import {multiSortBySortStateArray} from '../../../utils/sort-helpers';
import {ChytListAttributes} from '../../../store/actions/chyt/api';
import {getSettingsData} from '../settings-base';

export const getChytListData = (state: RootState) => state.chyt.list.data;

export const getChytListAvailableCreators = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return uniq_(items.map((item) => item.creator!)).sort();
});

export const getChytListAvailableStates = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return uniq_(items.map((item) => item.state!)).sort();
});

export const getChytCurrentAlias = (state: RootState) => state.chyt.clique.currentClique;

export const getChytListFilterAlias = (state: RootState) => state.chyt.listFilters.name;
export const getChytListFilterCreator = (state: RootState) => state.chyt.listFilters.creator;
export const getChytListFilterState = (state: RootState) => state.chyt.listFilters.state;

type ChytListColumns = Exclude<ChytListAttributes, 'creator' | 'state' | 'yt_operation_id'>;
const CHYT_LIST_SELECTABLE_COLUMNS: Record<ChytListColumns, true> = {
    instance_count: true,
    total_cpu: true,
    total_memory: true,
    health: true,
    creation_time: true,
    stage: true,
    yt_operation_start_time: true,
    yt_operation_finish_time: true,
    speclet_modification_time: true,
    strawberry_state_modification_time: true,
};

type ChytColumnItem = {checked: boolean; column: ChytListColumns};

export const getChytListColumnsFromSettings = (state: RootState) => {
    return (
        getSettingsData(state)['global::chyt::list_columns'] ??
        ([
            'creator',
            'instance_count',
            'total_cpu',
            'total_memory',
            'state',
            'health',
            'creation_time',
        ] as const)
    );
};

export const getChytListColumns = createSelector(
    [getChytListColumnsFromSettings],
    (columns): Array<ChytColumnItem> => {
        const userColumns = new Set(columns);
        return Object.keys(CHYT_LIST_SELECTABLE_COLUMNS).map((k) => {
            return {
                checked: userColumns.has(k),
                column: k as ChytListColumns,
            };
        });
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
    [getChytListFilterAlias, getChytListFilterCreator, getChytListFilterState],
    (alias, creator, state) => {
        const predicates = compact_([
            alias ? (item: ChytInfo) => -1 !== item.alias.indexOf(alias) : undefined,
            creator !== undefined ? (item: ChytInfo) => creator === item.creator : undefined,
            state ? (item: ChytInfo) => state === item.state : undefined,
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
