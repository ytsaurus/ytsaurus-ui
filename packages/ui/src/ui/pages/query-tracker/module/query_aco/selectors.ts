import intersection_ from 'lodash/intersection';
import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {RootState} from '../../../../store/reducers';
import {getSettingsData} from '../../../../store/selectors/settings/settings-base';
import {createSelector} from 'reselect';
import {DEFAULT_QUERY_ACO, SHARED_QUERY_ACO, getEffectiveApiStage} from '../query/selectors';
import {getClusterUiConfig} from '../../../../store/selectors/global';
const selectAcoState = (state: RootState) => state.queryTracker.aco;

export const getLastSelectedACONamespaces = (state: RootState) => {
    const stage = getEffectiveApiStage(state);

    return getSettingsData(state)[`qt-stage::${stage}::queryTracker::lastSelectedACOs`] ?? [];
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
    const stage = getEffectiveApiStage(state);

    return (queryTrackerDefaultACO && queryTrackerDefaultACO[stage]) || DEFAULT_QUERY_ACO;
};

export const getUserDefaultQueryACO = (state: RootState) => {
    const stage = getEffectiveApiStage(state);

    return getSettingsData(state)[`qt-stage::${stage}::queryTracker::defaultACO`];
};

export const getDefaultQueryACO = (state: RootState) => {
    return getUserDefaultQueryACO(state) ?? getClusterDefaultQueryACO(state);
};
