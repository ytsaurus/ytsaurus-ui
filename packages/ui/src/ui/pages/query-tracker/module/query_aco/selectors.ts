import intersection from 'lodash/intersection';
import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {RootState} from '../../../../store/reducers';
import {getSettingsData} from '../../../../store/selectors/settings-base';
import {createSelector} from 'reselect';
import {SHARED_QUERY_ACO} from '../query/selectors';
const selectAcoState = (state: RootState) => state.queryTracker.aco;

export const getLastSelectedACONamespaces = (state: RootState) => {
    const cluster = state.global.cluster;

    return getSettingsData(state)[`local::${cluster}::queryTracker::lastSelectedACOs`] ?? [];
};

export const getQueryACOOptions = (state: RootState): SelectOption[] => {
    const aco = new Set(
        intersection(
            getLastSelectedACONamespaces(state),
            selectAcoState(state).data.access_control_objects,
        ).concat(selectAcoState(state).data.access_control_objects),
    );

    return [...aco].map((text) => ({value: text, content: text}));
};

export const isSupportedQtACO = (state: RootState) =>
    selectAcoState(state).data.supported_features?.access_control;

export const selectIsMultipleAco = (state: RootState) =>
    selectAcoState(state).data.supported_features?.multiple_aco;

export const selectAvailableAco = (state: RootState) =>
    selectAcoState(state).data.access_control_objects;

export const isQueryTrackerInfoLoading = (state: RootState) => selectAcoState(state).loading;

export const getQueryTrackerInfo = (state: RootState) => selectAcoState(state).data;

export const isSupportedShareQuery = createSelector(
    [selectIsMultipleAco, selectAvailableAco],
    (isMultipleAco, aco) => {
        return Boolean(isMultipleAco) && aco.includes(SHARED_QUERY_ACO);
    },
);
