import {ThunkAction} from 'redux-thunk';

import {CHYT_LIST_FILTERS} from '../../../constants/chyt-page';
import {RootState} from '../../../store/reducers';
import {ChytInfo} from '../../../store/reducers/chyt/list';
import {ChytListFilters, ChytListFiltersAction} from '../../reducers/chyt/list-filters';
import {getChytListTableSortState} from '../../../store/selectors/chyt';
import {OrderType, updateSortStateArray} from '../../../utils/sort-helpers';

type ChytFiltersThunkAction<T = unknown> = ThunkAction<
    T,
    RootState,
    unknown,
    ChytListFiltersAction
>;

export function updateChytListFilters(data: Partial<ChytListFilters>): ChytListFiltersAction {
    return {type: CHYT_LIST_FILTERS, data};
}

export function chytToggleSortState(
    column: keyof ChytInfo,
    order: OrderType,
    options: {multisort?: boolean},
): ChytFiltersThunkAction {
    return (dispatch, getState) => {
        const prevSortState = getChytListTableSortState(getState());
        const sortState = updateSortStateArray(prevSortState, {column, order}, options);

        dispatch({type: CHYT_LIST_FILTERS, data: {sortState}});
    };
}
