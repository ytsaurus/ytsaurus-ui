import {Action} from 'redux';
import {
    CREATE_POOL_DIALOG_TREE_CREATE_FAILURE,
    CREATE_POOL_DIALOG_TREE_ITEMS_CANCELLED,
    CREATE_POOL_DIALOG_TREE_ITEMS_FAILED,
    CREATE_POOL_DIALOG_TREE_ITEMS_PARTIAL,
    CREATE_POOL_DIALOG_TREE_ITEMS_REQUEST,
    CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS,
} from '../../../constants/scheduling';
import {ActionD, YTError} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';

export interface CreatePoolDialogState {
    loaded: boolean;
    loading: boolean;
    error: YTError | null;

    currentTree: string;
    treeItems: TreeItems;

    visible: boolean;
}

export interface TreeItems {
    [name: string]: TreeItems;
}

const initialState: CreatePoolDialogState = {
    loaded: false,
    loading: false,
    error: null,

    currentTree: '',
    treeItems: {},

    visible: false,
};

function reducerImpl(
    state: CreatePoolDialogState,
    action: CreatePoolDialogAction,
): CreatePoolDialogState {
    switch (action.type) {
        case CREATE_POOL_DIALOG_TREE_ITEMS_REQUEST:
            return {...state, loading: true};
        case CREATE_POOL_DIALOG_TREE_ITEMS_CANCELLED:
            return {...state, loading: false};
        case CREATE_POOL_DIALOG_TREE_ITEMS_FAILED:
            return {
                ...state,
                loading: false,
                loaded: true,
                error: action.data,
            };
        case CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS:
            return {...state, loading: false, loaded: true, ...action.data};
        case CREATE_POOL_DIALOG_TREE_ITEMS_PARTIAL:
            return {...state, ...action.data};
        case CREATE_POOL_DIALOG_TREE_CREATE_FAILURE:
            return {...state, error: action.data};
    }
}

function reducer(state: CreatePoolDialogState = initialState, action: CreatePoolDialogAction) {
    return reducerImpl(state, action) || state;
}

export type CreatePoolDialogAction =
    | Action<typeof CREATE_POOL_DIALOG_TREE_ITEMS_REQUEST>
    | Action<typeof CREATE_POOL_DIALOG_TREE_ITEMS_CANCELLED>
    | ActionD<typeof CREATE_POOL_DIALOG_TREE_ITEMS_FAILED, YTError>
    | ActionD<
          typeof CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS,
          Pick<CreatePoolDialogState, 'currentTree' | 'treeItems'>
      >
    | ActionD<
          typeof CREATE_POOL_DIALOG_TREE_ITEMS_PARTIAL,
          Partial<Pick<CreatePoolDialogState, 'currentTree' | 'treeItems'>>
      >
    | ActionD<typeof CREATE_POOL_DIALOG_TREE_CREATE_FAILURE, YTError>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
