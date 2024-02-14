import intersection from 'lodash/intersection';
import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {RootState} from '../../../../store/reducers';
import {getSettingsData} from '../../../../store/selectors/settings-base';
const getState = (state: RootState) => state.queryTracker.aco;

export const getLastSelectedACONamespaces = (state: RootState) => {
    const cluster = state.global.cluster;

    return getSettingsData(state)[`local::${cluster}::queryTracker::lastSelectedACOs`] ?? [];
};

export const getQueryACOOptions = (state: RootState): SelectOption[] => {
    const aco = new Set(
        intersection(
            getLastSelectedACONamespaces(state),
            getState(state).data.access_control_objects,
        ).concat(getState(state).data.access_control_objects),
    );

    return [...aco].map((text) => ({value: text, content: text}));
};

export const isSupportedQtACO = (state: RootState) =>
    getState(state).data.supported_features?.access_control;

export const isQueryTrackerInfoLoading = (state: RootState) => getState(state).loading;

export const getQueryTrackerInfo = (state: RootState) => getState(state).data;
