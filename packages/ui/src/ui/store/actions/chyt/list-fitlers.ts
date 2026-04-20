import {type ThunkAction} from 'redux-thunk';

import {CHYT_LIST_FILTERS} from '../../../constants/chyt-page';
import {type RootState} from '../../../store/reducers';
import {type ChytInfo} from '../../../store/reducers/chyt/list';
import {type ChytListFilters, type ChytListFiltersAction} from '../../reducers/chyt/list-filters';
import {selectChytListTableSortState} from '../../../store/selectors/chyt';
import {type OrderType, updateSortStateArray} from '../../../utils/sort-helpers';

type ChytFiltersThunkAction<T = unknown> = ThunkAction<
    T,
    RootState,
    unknown,
    ChytListFiltersAction
>;

export function chytUpdateListFilters(data: Partial<ChytListFilters>): ChytListFiltersAction {
    return {type: CHYT_LIST_FILTERS, data};
}

export function chytToggleSortState(
    column: keyof ChytInfo,
    order: OrderType,
    options: {multisort?: boolean},
): ChytFiltersThunkAction {
    return (dispatch, getState) => {
        const prevSortState = selectChytListTableSortState(getState());
        const sortState = updateSortStateArray(prevSortState, {column, order}, options);

        dispatch({type: CHYT_LIST_FILTERS, data: {sortState}});
    };
}
