import {RootState} from '../../reducers';

export const getRawStatistic = (state: RootState) =>
    state.job?.general?.job?.attributes?.statistics;
