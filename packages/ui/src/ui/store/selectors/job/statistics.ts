import {type RootState} from '../../reducers';

export const selectRawStatistic = (state: RootState) =>
    state.job?.general?.job?.attributes?.statistics;
