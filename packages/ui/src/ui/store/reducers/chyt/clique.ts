import {Action} from 'redux';
import {CHYT_CLIQUE} from '../../../constants/chyt-page';
import {ActionD, YTError} from '../../../types';

import {mergeStateOnClusterChange} from '../utils';

export type ChytCliqueState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    currentClique: string;
    data: ChytCliqueInfo | undefined;
};

export type ChytCliqueInfo = {};

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
            return {...initialState, ...action.data};
        }
        case CHYT_CLIQUE.SUCCESS: {
            return {...state, ...action.data};
        }
        case CHYT_CLIQUE.CANCELLED: {
            return {...state, loading: false};
        }
        default:
            return state;
    }
}

export type ChytCliqueAction =
    | ActionD<typeof CHYT_CLIQUE.REQUEST, Pick<ChytCliqueState, 'currentClique'>>
    | ActionD<typeof CHYT_CLIQUE.SUCCESS, Pick<ChytCliqueState, 'data'>>
    | Action<typeof CHYT_CLIQUE.CANCELLED>;

export default mergeStateOnClusterChange(ephemeralState, persitentState, reducer);
