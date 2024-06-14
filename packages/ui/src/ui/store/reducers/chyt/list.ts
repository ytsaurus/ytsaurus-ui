import type {Action} from 'redux';

import type {ActionD, YTError} from '../../../types';

import {CHYT_LIST} from '../../../constants/chyt-page';
import {ChytListResponseItem} from '../../../utils/api';

import {mergeStateOnClusterChange} from '../utils';

export type ChytListState = {
    loading: boolean | undefined;
    loaded: boolean | undefined;
    error: YTError | undefined;

    data: {items?: Array<ChytInfo>};
};

export type ChytInfo = ChytListResponseItem['$attributes'] & {
    alias: string;
};

const initialState: ChytListState = {
    loading: undefined,
    loaded: undefined,
    error: undefined,

    data: {},
};

function reducer(state = initialState, action: ChytListAction) {
    switch (action.type) {
        case CHYT_LIST.REQUEST:
            return {...state, loading: true};
        case CHYT_LIST.SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true};
        case CHYT_LIST.CANCELLED:
            return {...state, loading: false};
        case CHYT_LIST.FAILURE:
            return {...state, loading: false, ...action.data};
        default:
            return state;
    }
}

export type ChytListAction =
    | Action<typeof CHYT_LIST.REQUEST>
    | ActionD<typeof CHYT_LIST.SUCCESS, Pick<ChytListState, 'data'>>
    | Action<typeof CHYT_LIST.CANCELLED>
    | ActionD<typeof CHYT_LIST.FAILURE, Pick<ChytListState, 'error'>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
