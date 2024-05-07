import {ActionD, SortState} from '../../../../types';
import {ACCOUNTS_USAGE_FILTERS_PARTIAL} from '../../../../constants/accounts/accounts';
import {DatepickerOutputDates} from '../../../../components/common/Datepicker';

export const PAGE_SIZE = 100;

export type AccountUsageViewType =
    | 'list'
    | 'tree'
    | 'list-plus-folders'
    | 'list-diff'
    | 'tree-diff'
    | 'list-plus-folders-diff';

export interface AccountUsageFiltersState {
    treePath: string;

    visibleColumns: Array<string>;

    sortState: Array<SortState>;

    pathFilter: string;
    ownerFilter: string;

    dateRange: DatepickerOutputDates;
    dateRangeType: 'creation_time' | 'modification_time';

    pageIndex: number;

    currentSnapshot?: number;

    diffFromSnapshot?: number;
    diffToSnapshot?: number;

    viewType: AccountUsageViewType | undefined;
}

export const initialUsageFiltersState: AccountUsageFiltersState = {
    treePath: '/',

    sortState: [{column: 'path', order: 'asc'}],
    pathFilter: '',
    ownerFilter: '',

    dateRange: {from: null, to: null},
    dateRangeType: 'modification_time',

    visibleColumns: [],

    pageIndex: 0,

    viewType: undefined,
};

export default function reducer(
    state = initialUsageFiltersState,
    action: AccountsUsageFiltersAction,
) {
    switch (action.type) {
        case ACCOUNTS_USAGE_FILTERS_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type AccountsUsageFiltersAction = ActionD<
    typeof ACCOUNTS_USAGE_FILTERS_PARTIAL,
    Partial<AccountUsageFiltersState>
>;
