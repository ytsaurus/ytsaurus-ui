import {
    SET_TREE_STATE,
    CHANGE_FILTER_TEXT,
    CHANGE_AGGREGATION,
    CHANGE_JOB_TYPE,
} from '../../../constants/operations/statistics';
import {getOperation} from '../../../store/selectors/operations/operation';
import {getSettingOperationStatisticsActiveJobTypes} from '../../../store/selectors/settings-ts';
import {setSettingsStatisticsActiveJobTypes} from '../../../store/actions/settings/settings';

export function setTreeState(treeState) {
    return {
        type: SET_TREE_STATE,
        data: {treeState},
    };
}

export function changeFilterText(filterText) {
    return {
        type: CHANGE_FILTER_TEXT,
        data: {filterText},
    };
}

export function changeAggregation({target}) {
    return {
        type: CHANGE_AGGREGATION,
        data: {activeAggregation: target.value},
    };
}

export function changeJobType(jobType) {
    return (dispatch, getState) => {
        dispatch({
            type: CHANGE_JOB_TYPE,
            data: {activeJobType: jobType},
        });

        const state = getState();
        const operationType = getOperation(state).type;
        const settingsJobTypes = getSettingOperationStatisticsActiveJobTypes(state);

        if (settingsJobTypes && settingsJobTypes[operationType] !== jobType) {
            dispatch(
                setSettingsStatisticsActiveJobTypes({
                    ...settingsJobTypes,
                    [operationType]: jobType,
                }),
            );
        }
    };
}
