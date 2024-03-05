import type {Action} from 'redux';

import type {ActionD, YTError} from '../../../types';

import {MANAGE_TOKENS_LIST} from '../../../constants/manage-tokens';

import {mergeStateOnClusterChange} from '../utils';

export type ManageTokensListState = {
    loading: boolean | undefined;
    loaded: boolean | undefined;
    error: YTError | undefined;
    data:
        | Array<string>
        | null
        | Record<
              string,
              {
                  creation_time?: string;
                  description?: string;
                  effective_expiration: {time?: string; timeout?: string};
                  token_prefix?: string;
              }
          >;
};

const initialState: ManageTokensListState = {
    loading: undefined,
    loaded: undefined,
    error: undefined,
    data: null,
};

export type ManageTokensListAction =
    | Action<typeof MANAGE_TOKENS_LIST.REQUEST>
    | ActionD<typeof MANAGE_TOKENS_LIST.SUCCESS, Pick<ManageTokensListState, 'data'>>
    | Action<typeof MANAGE_TOKENS_LIST.CANCELLED>
    | ActionD<typeof MANAGE_TOKENS_LIST.FAILURE, Pick<ManageTokensListState, 'error'>>;

function reducer(state = initialState, action: ManageTokensListAction) {
    switch (action.type) {
        case MANAGE_TOKENS_LIST.REQUEST:
            return {...state, loading: true};
        case MANAGE_TOKENS_LIST.SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true};
        case MANAGE_TOKENS_LIST.CANCELLED:
            return {...state, loading: false};
        case MANAGE_TOKENS_LIST.FAILURE:
            return {...state, loading: false, ...action.data};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, reducer);
