import {
    TREE_STATE,
    SET_TREE_STATE,
    CHANGE_FILTER_TEXT,
    CHANGE_AGGREGATION,
    CHANGE_JOB_TYPE,
} from '../../../../constants/operations/statistics';
import {GET_OPERATION} from '../../../../constants/operations/detail';

import {
    prepareStatistics,
    prepareMetricsTree,
    flatMetricsTree,
    prepareJobTypeOptions,
} from '../../../../utils/operations/tabs/statistics/statistics';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {getPath} from '../../../../../shared/utils/settings';
import {getSettingsDataFromInitialConfig} from '../../../../config';
import type {ActionD, ValueOf} from '../../../../types';

export const INITIAL_ACTIVE_JOB_TYPE = null;
const settings = getSettingsDataFromInitialConfig().data;
const {STATISTICS_AGGREGATION_TYPE} = SettingName.OPERATIONS;
const {OPERATIONS} = NAMESPACES;

const activeAggregation = settings[getPath(STATISTICS_AGGREGATION_TYPE, OPERATIONS)];

interface OperationStatistics {
    tree: Record<string, unknown>;
    items: Array<unknown>;
    filterText: string;
    jobTypes: Array<string>;
    activeAggregation: typeof activeAggregation;
    activeJobType: null | string;
    treeState: ValueOf<typeof TREE_STATE>;
}

export const initialState: OperationStatistics = {
    tree: {},
    items: [],
    /* @type: string */
    filterText: '',
    jobTypes: [],
    activeAggregation: activeAggregation,
    activeJobType: INITIAL_ACTIVE_JOB_TYPE,
    treeState: TREE_STATE.EXPANDED,
};

export default (state = initialState, action: OperationStaticsAction) => {
    switch (action.type) {
        case GET_OPERATION.SUCCESS: {
            const {filterText} = state;
            const {operation} = action.data;

            const statistics = prepareStatistics(operation);
            const tree = prepareMetricsTree(statistics);
            const items = flatMetricsTree(tree, filterText);
            const jobTypes = prepareJobTypeOptions(statistics);

            return {...state, tree, items, jobTypes};
        }

        case SET_TREE_STATE: {
            const {treeState} = action.data;

            return {...state, treeState};
        }

        case CHANGE_FILTER_TEXT: {
            const {tree} = state;
            const {filterText} = action.data;

            const items = flatMetricsTree(tree, filterText);

            return {...state, filterText, items};
        }

        case CHANGE_AGGREGATION: {
            const {activeAggregation} = action.data;

            return {...state, activeAggregation};
        }

        case CHANGE_JOB_TYPE: {
            const {activeJobType} = action.data;

            return {...state, activeJobType};
        }

        default:
            return state;
    }
};

type OperationStaticsAction =
    | ActionD<typeof GET_OPERATION.SUCCESS, {operation: unknown}>
    | ActionD<typeof SET_TREE_STATE, Pick<OperationStatistics, 'treeState'>>
    | ActionD<typeof CHANGE_FILTER_TEXT, Pick<OperationStatistics, 'filterText'>>
    | ActionD<typeof CHANGE_AGGREGATION, Pick<OperationStatistics, 'activeAggregation'>>
    | ActionD<typeof CHANGE_JOB_TYPE, Pick<OperationStatistics, 'activeJobType'>>;
