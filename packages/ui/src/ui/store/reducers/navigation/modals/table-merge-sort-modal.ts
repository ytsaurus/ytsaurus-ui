import {ActionD, YTError} from '../../../../types';
import {TABLE_SORT_MODAL_PARTIAL} from '../../../../constants/navigation/modals/table-sort-modal';

export interface TableSortMergeModal {
    sortVisible: boolean;
    mergeVisible: boolean;
    paths: Array<string>;
    suggestColumns: Array<string>;
    error?: YTError;
}

const initialState: TableSortMergeModal = {
    sortVisible: false,
    mergeVisible: false,
    paths: [],
    suggestColumns: [],
};

export default function reducer(state = initialState, action: TableSortModalAction) {
    switch (action.type) {
        case TABLE_SORT_MODAL_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type TableSortModalAction = ActionD<
    typeof TABLE_SORT_MODAL_PARTIAL,
    TableSortMergeActionData
>;

type TableSortMergeActionData =
    | Pick<TableSortMergeModal, 'sortVisible' | 'paths'>
    | Pick<TableSortMergeModal, 'mergeVisible' | 'paths'>
    | Pick<TableSortMergeModal, 'error'>
    | Pick<TableSortMergeModal, 'suggestColumns'>;
