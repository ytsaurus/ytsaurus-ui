import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';

export const selectQueryTrackerInfo = (state: RootState) => state.queryTracker.aco.data;

export const getAvailableYql = createSelector([selectQueryTrackerInfo], (qtInfo) => {
    const versions = qtInfo?.engines_info?.yql?.available_yql_versions;
    return Array.isArray(versions) ? versions : [];
});

export const getDefaultYqlVersion = createSelector([selectQueryTrackerInfo], (qtInfo) => {
    return qtInfo?.engines_info?.yql?.default_yql_ui_version;
});

export const selectSpytEnginesInfo = (state: RootState) => {
    return selectQueryTrackerInfo(state)?.engines_info?.spyt;
};
