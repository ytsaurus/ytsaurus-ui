import {RootState} from '../reducers';

export function selectExecuteBatchState(state: RootState) {
    return state.executeBatch;
}
