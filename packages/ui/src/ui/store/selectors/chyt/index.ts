import {createSelector} from 'reselect';
import uniq_ from 'lodash/uniq';
import compact_ from 'lodash/compact';

import {concatByAnd} from '../../../common/hammer/predicate';

import {RootState} from '../../../store/reducers';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {SortState} from '../../../types';
import {multiSortBySortStateArray} from '../../../utils/sort-helpers';

export const getChytListData = (state: RootState) => state.chyt.list.data;

export const getChytListAvailableCreators = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return uniq_(items.map((item) => item.creator!)).sort();
});

export const getChytListAvailableStates = createSelector([getChytListData], (data) => {
    const {items = []} = data;
    return uniq_(items.map((item) => item.state!)).sort();
});

export const getChytCurrrentClique = (_state: RootState) => '';

export const getChytListFilterAlias = (state: RootState) => state.chyt.listFilters.name;
export const getChytListFilterCreator = (state: RootState) => state.chyt.listFilters.creator;
export const getChytListFilterState = (state: RootState) => state.chyt.listFilters.state;

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
