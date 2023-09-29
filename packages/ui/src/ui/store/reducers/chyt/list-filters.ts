import {CHYT_LIST_FILTERS} from '../../../constants/chyt-page';
import {ActionD, SortState} from '../../../types';
import {ChytInfo} from './list';

export type ChytListFilters = {
    nameIdFilter: string;
    creator: string | undefined;
    state: string | undefined;

    sortState: Array<SortState<keyof ChytInfo>>;
};

export const initialState: ChytListFilters = {
    nameIdFilter: '',
    creator: undefined,
    state: undefined,

    sortState: [],
};

export default function reducer(state = initialState, action: ChytListFiltersAction) {
    switch (action.type) {
        case CHYT_LIST_FILTERS:
            return {...state, ...action.data};
    }
    return state;
}

export type ChytListFiltersAction = ActionD<typeof CHYT_LIST_FILTERS, Partial<ChytListFilters>>;
