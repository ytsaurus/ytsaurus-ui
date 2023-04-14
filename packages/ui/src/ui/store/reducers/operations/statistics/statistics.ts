import {
    TREE_STATE,
    SET_TREE_STATE,
    CHANGE_FILTER_TEXT,
    CHANGE_AGGREGATION,
    OPERATION_STATISTICS_PARTIAL,
    STATISTICS_FILTER_ALL_VALUE,
} from '../../../../constants/operations/statistics';
import {GET_OPERATION} from '../../../../constants/operations/detail';

import {
    prepareStatistics,
    prepareMetricsTree,
    flatMetricsTree,
} from '../../../../utils/operations/tabs/statistics/statistics';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {getPath} from '../../../../../shared/utils/settings';
import {getSettingsDataFromInitialConfig} from '../../../../config';
import type {ActionD, ValueOf} from '../../../../types';

const settings = getSettingsDataFromInitialConfig().data;
const {STATISTICS_AGGREGATION_TYPE} = SettingName.OPERATIONS;
const {OPERATIONS} = NAMESPACES;

const activeAggregation = settings[getPath(STATISTICS_AGGREGATION_TYPE, OPERATIONS)];

export interface OperationStatistics {
    tree: Record<string, unknown>;
    items: Array<unknown>;
    filterText: string;
    activeAggregation: typeof activeAggregation;
    jobTypeFilter: string;
    poolTreeFilter: string;
    treeState: ValueOf<typeof TREE_STATE>;
}

export const initialState: OperationStatistics = {
    tree: {},
    items: [],
    /* @type: string */
    filterText: '',
    activeAggregation: activeAggregation,
    jobTypeFilter: STATISTICS_FILTER_ALL_VALUE,
    poolTreeFilter: STATISTICS_FILTER_ALL_VALUE,
    treeState: TREE_STATE.EXPANDED,
};

export default (state = initialState, action: OperationStaticsAction): OperationStatistics => {
    switch (action.type) {
        case GET_OPERATION.SUCCESS: {
            const {filterText} = state;
            const {operation} = action.data;

            const statistics = prepareStatistics(operation);
            const tree = prepareMetricsTree(statistics);
            const items = flatMetricsTree(tree, filterText);

            return {...state, tree, items};
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

        case OPERATION_STATISTICS_PARTIAL: {
            return {...state, ...action.data};
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
    | ActionD<
          typeof OPERATION_STATISTICS_PARTIAL,
          Pick<OperationStatistics, 'jobTypeFilter' | 'poolTreeFilter'>
      >;
