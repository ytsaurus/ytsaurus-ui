import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../constants/utils';
import {AnyAction, Reducer} from 'redux';

type StrictReducer<S, A> = (s: S, a: A) => S;

export function mergeStateOnClusterChange<E, P, A extends AnyAction>(
    ephemeralState: E,
    persistedState: P,
    reducer: StrictReducer<E & P, A>,
): Reducer<E & P, A> {
    return (
        state: E & P = {...ephemeralState, ...persistedState},
        action: A = {} as any,
    ): E & P => {
        if (action.type === RESET_STORE_BEFORE_CLUSTER_CHANGE) {
            const {shouldUsePreserveState} = action.data;

            return shouldUsePreserveState
                ? ({...state, ...ephemeralState} as E & P)
                : ({...state, ...ephemeralState, ...persistedState} as E & P);
        }

        return reducer(state, action) || state;
    };
}
