import {JobStatistic} from '../../../types/job';
import {RootState} from '../../reducers';

export const getRawStatistic = (state: RootState) =>
    state.job.general.job.statistics as JobStatistic;
