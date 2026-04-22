import intersection_ from 'lodash/intersection';
import {type SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {type RootState} from '../../reducers';
import {getSettingsData} from '../settings/settings-base';
import {createSelector} from 'reselect';
import {DEFAULT_QUERY_ACO, SHARED_QUERY_ACO, selectEffectiveApiStage} from './query';
import {selectClusterUiConfig} from '../global';
import {
    selectAvailableYql,
    selectDefaultYqlVersion,
    selectQueryTrackerInfo,
    selectSpytEnginesInfo,
} from './queryTrackerEnginesInfo';

const selectAcoState = (state: RootState) => state.queryTracker.aco;

export {selectAvailableYql, selectDefaultYqlVersion, selectQueryTrackerInfo, selectSpytEnginesInfo};

export const selectQueryTrackerInfoClusters = (state: RootState) =>
    state.queryTracker.aco.data.clusters;

export const selectLastSelectedACONamespaces = (state: RootState) => {
    const stage = selectEffectiveApiStage(state);

    return getSettingsData(state)[`qt-stage::${stage}::queryTracker::lastSelectedACOs`] ?? [];
};

export const selectQueryACOOptions = (state: RootState): SelectOption[] => {
    const aco = new Set(
        intersection_(
            selectLastSelectedACONamespaces(state),
            selectAcoState(state).data.access_control_objects,
        ).concat(selectAcoState(state).data.access_control_objects),
    );

    return [...aco].map((text) => ({value: text, content: text}));
};

export const selectIsSupportedQtACO = (state: RootState) =>
    selectAcoState(state).data.supported_features?.access_control;

export const selectIsMultipleAco = (state: RootState) =>
    Boolean(selectAcoState(state).data.supported_features?.multiple_aco);

export const selectIsSupportedTutorials = (state: RootState) =>
    Boolean(selectAcoState(state).data.supported_features?.tutorials);

export const selectAvailableAco = (state: RootState) =>
    selectAcoState(state).data.access_control_objects;

export const selectIsQueryTrackerInfoLoading = (state: RootState) => selectAcoState(state).loading;

const selectQueryDraftYqlVersion = (state: RootState) =>
    state.queryTracker.query.draft.settings?.yql_version;

export const selectEffectiveYqlVersion = createSelector(
    [selectQueryDraftYqlVersion, selectDefaultYqlVersion],
    (draftVersion, defaultVersion) => draftVersion || defaultVersion,
);

export const selectIsSupportedShareQuery = createSelector(
    [selectIsMultipleAco, selectAvailableAco],
    (isMultipleAco, aco) => {
        return isMultipleAco && aco.includes(SHARED_QUERY_ACO);
    },
);

export const selectClusterDefaultQueryACO = (state: RootState) => {
    const queryTrackerDefaultACO = selectClusterUiConfig(state)?.query_tracker_default_aco;
    const stage = selectEffectiveApiStage(state);

    return (queryTrackerDefaultACO && queryTrackerDefaultACO[stage]) || DEFAULT_QUERY_ACO;
};

export const selectUserDefaultQueryACO = (state: RootState) => {
    const stage = selectEffectiveApiStage(state);

    return getSettingsData(state)[`qt-stage::${stage}::queryTracker::defaultACO`];
};

export const selectDefaultQueryACO = (state: RootState) => {
    return selectUserDefaultQueryACO(state) ?? selectClusterDefaultQueryACO(state);
};
