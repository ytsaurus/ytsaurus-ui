import {CHYT_CLIQUE} from '../../../constants/chyt-page';
import {ChytStatusResponse} from '../../../store/actions/chyt/api';
import {ActionD, YTError} from '../../../types';

import {mergeStateOnClusterChange} from '../utils';

export type ChytCliqueState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    currentClique: string;
    data: ChytStatusResponse | undefined;
};

const persitentState: Pick<ChytCliqueState, 'currentClique'> = {
    currentClique: '',
};

const ephemeralState: Omit<ChytCliqueState, keyof typeof persitentState> = {
    loading: false,
    loaded: false,
    error: undefined,
    data: undefined,
};

const initialState: ChytCliqueState = {
    ...ephemeralState,
    ...persitentState,
};

function reducer(state = initialState, action: ChytCliqueAction): ChytCliqueState {
    switch (action.type) {
        case CHYT_CLIQUE.REQUEST: {
            return {...state, ...action.data, loading: true};
        }
        case CHYT_CLIQUE.SUCCESS: {
            return {...state, ...action.data, loaded: true, loading: false};
        }
        case CHYT_CLIQUE.FAILURE: {
            return {...state, ...action.data, loading: false};
        }
        default:
            return state;
    }
}

export type ChytCliqueAction =
    | ActionD<typeof CHYT_CLIQUE.REQUEST, Pick<ChytCliqueState, 'currentClique'>>
    | ActionD<typeof CHYT_CLIQUE.SUCCESS, Pick<ChytCliqueState, 'data'>>
    | ActionD<typeof CHYT_CLIQUE.FAILURE, Pick<ChytCliqueState, 'error'>>;

export default mergeStateOnClusterChange(ephemeralState, persitentState, reducer);
