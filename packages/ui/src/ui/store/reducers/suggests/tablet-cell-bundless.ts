import {ActionD, YTError} from '../../../types';
import {
    SUGGEST_TABLET_CELL_BUNDLES_ERROR,
    SUGGEST_TABLET_CELL_BUNDLES_REQUEST,
    SUGGEST_TABLET_CELL_BUNDLES_SUCCESS,
} from '../../../constants/suggests';
import {Action} from 'redux';
import {mergeStateOnClusterChange} from '../utils';

export interface State {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    items: Array<string>;
}

const initialState: State = {
    loading: false,
    loaded: false,
    error: undefined,

    items: [],
};

function stateReducer(state = initialState, action: TabletCellBundlesSuggestAction): State {
    switch (action.type) {
        case 'SUGGEST_TABLET_CELL_BUNDLES_REQUEST':
            return {...state, loading: true};
        case 'SUGGEST_TABLET_CELL_BUNDLES_ERROR':
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.data,
            };
        case 'SUGGEST_TABLET_CELL_BUNDLES_SUCCESS':
            return {...state, ...action.data};
    }
}

export type TabletCellBundlesSuggestAction =
    | Action<typeof SUGGEST_TABLET_CELL_BUNDLES_REQUEST>
    | ActionD<typeof SUGGEST_TABLET_CELL_BUNDLES_SUCCESS, Pick<State, 'items'>>
    | ActionD<typeof SUGGEST_TABLET_CELL_BUNDLES_ERROR, State['error']>;

function reducer(state = initialState, action: TabletCellBundlesSuggestAction) {
    return stateReducer(state, action) || state;
}

export default mergeStateOnClusterChange(initialState, {}, reducer);
