import {
    CHANGE_AGGREGATION,
    CHANGE_FILTER_TEXT,
    OPERATION_STATISTICS_PARTIAL,
    SET_TREE_STATE,
    STATISTICS_FILTER_ALL_VALUE,
    TREE_STATE,
} from '../../../../constants/operations/statistics';
import {GET_OPERATION} from '../../../../constants/operations/detail';

import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {getPath} from '../../../../../shared/utils/settings';
import {getSettingsDataFromInitialConfig} from '../../../../config';
import type {ActionD, ValueOf} from '../../../../types';

const settings = getSettingsDataFromInitialConfig().data;
const {STATISTICS_AGGREGATION_TYPE} = SettingName.OPERATIONS;
const {OPERATIONS} = NAMESPACES;

const activeAggregation = settings[getPath(STATISTICS_AGGREGATION_TYPE, OPERATIONS)];

export interface OperationStatistics {
    filterText: string;
    activeAggregation: typeof activeAggregation;
    jobTypeFilter: string;
    poolTreeFilter: string;
    treeState: ValueOf<typeof TREE_STATE>;
}

export const initialState: OperationStatistics = {
    filterText: '',
    activeAggregation: activeAggregation,
    jobTypeFilter: STATISTICS_FILTER_ALL_VALUE,
    poolTreeFilter: STATISTICS_FILTER_ALL_VALUE,
    treeState: TREE_STATE.EXPANDED,
};

export default (state = initialState, action: OperationStaticsAction): OperationStatistics => {
    switch (action.type) {
        case SET_TREE_STATE: {
            const {treeState} = action.data;

            return {...state, treeState};
        }

        case CHANGE_FILTER_TEXT: {
            const {filterText} = action.data;

            return {...state, filterText};
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
