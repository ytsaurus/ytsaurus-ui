import intersection_ from 'lodash/intersection';
import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {RootState} from '../../../../store/reducers';
import {getSettingsData} from '../../../../store/selectors/settings-base';
import {createSelector} from 'reselect';
import {DEFAULT_QUERY_ACO, SHARED_QUERY_ACO, getCurrentStage} from '../query/selectors';
import {getClusterUiConfig} from '../../../../store/selectors/global';
import get_ from 'lodash/get';
const selectAcoState = (state: RootState) => state.queryTracker.aco;

export const getLastSelectedACONamespaces = (state: RootState) => {
    const cluster = state.global.cluster;
    const stage = getCurrentStage(state);

    return (
        getSettingsData(state)[`qt-stage::${cluster}::queryTracker::${stage}::lastSelectedACOs`] ??
        []
    );
};

export const getQueryACOOptions = (state: RootState): SelectOption[] => {
    const aco = new Set(
        intersection_(
            getLastSelectedACONamespaces(state),
            selectAcoState(state).data.access_control_objects,
        ).concat(selectAcoState(state).data.access_control_objects),
    );

    return [...aco].map((text) => ({value: text, content: text}));
};

export const isSupportedQtACO = (state: RootState) =>
    selectAcoState(state).data.supported_features?.access_control;

export const selectIsMultipleAco = (state: RootState) =>
    Boolean(selectAcoState(state).data.supported_features?.multiple_aco);

export const selectAvailableAco = (state: RootState) =>
    selectAcoState(state).data.access_control_objects;

export const isQueryTrackerInfoLoading = (state: RootState) => selectAcoState(state).loading;

export const getQueryTrackerInfo = (state: RootState) => selectAcoState(state).data;

export const isSupportedShareQuery = createSelector(
    [selectIsMultipleAco, selectAvailableAco],
    (isMultipleAco, aco) => {
        return isMultipleAco && aco.includes(SHARED_QUERY_ACO);
    },
);

export const getClusterDefaultQueryACO = (state: RootState) => {
    const queryTrackerDefaultACO = getClusterUiConfig(state)?.query_tracker_default_aco;
    const stage = getCurrentStage(state);

    return get_(queryTrackerDefaultACO, stage, DEFAULT_QUERY_ACO);
};

export const getUserDefaultQueryACO = (state: RootState) => {
    const cluster = state.global.cluster;
    const stage = getCurrentStage(state);

    return getSettingsData(state)[`qt-stage::${cluster}::queryTracker::${stage}::defaultACO`];
};

export const getDefaultQueryACO = (state: RootState) => {
    return getUserDefaultQueryACO(state) ?? getClusterDefaultQueryACO(state);
};
