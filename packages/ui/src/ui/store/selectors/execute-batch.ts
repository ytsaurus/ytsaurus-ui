import {RootState} from '../reducers';

export function getExecuteBatchState(state: RootState) {
    return state.executeBatch;
}
