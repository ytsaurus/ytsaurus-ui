import * as JOB from '../../../constants/job';
import {GeneralActionType} from '../../../store/actions/job/general';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {StatisticsActionType} from '../../../store/actions/job/statistics';
import {JobStatistic, JobTree, RawJob, JobTreeState} from '../../../types/job';
import {prepareStatistics, prepareMetricsTree} from '../../../utils/job/tabs/statistics';

export interface StatisticsEphemeralState {
    tree: Partial<JobTree>;
}

export interface StatisticsPersistedState {
    treeState: JobTreeState;
    filter: string;
}

export type StatisticsState = StatisticsEphemeralState & StatisticsPersistedState;

const ephemeralState: StatisticsEphemeralState = {
    tree: {},
};

const persistedState: StatisticsPersistedState = {
    treeState: JOB.TREE_STATE.EXPANDED,
    filter: '',
};

export const initialState: StatisticsState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (
    state = initialState,
    action: GeneralActionType | StatisticsActionType,
): StatisticsState => {
    switch (action.type) {
        case JOB.LOAD_JOB_DATA_SUCCESS: {
            const job: RawJob = action.data.job;
            const statistics: JobStatistic = prepareStatistics(job);
            const tree: JobTree = prepareMetricsTree(statistics);

            return {...state, tree};
        }

        case JOB.EXPAND_TABLE: {
            return {...state, treeState: JOB.TREE_STATE.EXPANDED};
        }

        case JOB.COLLAPSE_TABLE: {
            return {...state, treeState: JOB.TREE_STATE.COLLAPSED};
        }

        case JOB.MIX_TABLE: {
            return {...state, treeState: JOB.TREE_STATE.MIXED};
        }

        case JOB.CHANGE_FILTER: {
            const filter: string = action.data.filter;

            return {...state, filter};
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
