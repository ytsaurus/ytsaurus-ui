import {ActionD, YTError} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';
import {CHYT_SPECLET} from '../../../constants/chyt-page';
import {ChytDescribeOptionsType} from '../../../store/actions/chyt/api';

export type ChytCliqueSpecletState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    dataAlias: string;
    data: ChytDescribeOptionsType | undefined;
};

const initialState: ChytCliqueSpecletState = {
    loaded: false,
    loading: false,
    error: undefined,
    dataAlias: '',
    data: undefined,
};

function reducer(state = initialState, action: ChytCliqueSpecletAction) {
    switch (action.type) {
        case CHYT_SPECLET.REQUEST:
            return {...state, ...action.data, loading: true};
        case CHYT_SPECLET.SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true, error: undefined};
        case CHYT_SPECLET.FAILURE:
            return {...state, ...action.data, loading: false};
        default:
            return state;
    }
}

export type ChytCliqueSpecletAction =
    | ActionD<typeof CHYT_SPECLET.REQUEST, Pick<ChytCliqueSpecletState, 'dataAlias'>>
    | ActionD<typeof CHYT_SPECLET.SUCCESS, Pick<ChytCliqueSpecletState, 'data' | 'dataAlias'>>
    | ActionD<typeof CHYT_SPECLET.FAILURE, Pick<ChytCliqueSpecletState, 'error'>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
