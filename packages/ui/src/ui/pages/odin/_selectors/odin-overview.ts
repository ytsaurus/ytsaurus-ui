import _ from 'lodash';
import {createSelector} from 'reselect';
import {getSettingOdinOverviewVisiblePresets} from './index';
import {OdinRootState} from '../_reducers';
import {makeGetSetting} from '../../../store/selectors/settings';
import {OdinTab} from '../odin-constants';
import {ODIN_LAST_VISITED_TAB} from '../odin-settings';
import {NAMESPACES} from '../../../../shared/constants/settings';

export const getOdinOverviewTimeFromFilter = (state: OdinRootState) =>
    state.odin.overview.timeFromFilter;
export const getOdinOverviewTimeFrom = (state: OdinRootState) => state.odin.overview.timeFrom;
export const getOdinOverviewTimeTo = (state: OdinRootState) => state.odin.overview.timeTo;
export const getOdinOverviewLoading = (state: OdinRootState) => state.odin.overview.loading;
export const getOdinOverviewData = (state: OdinRootState) => state.odin.overview.data;
export const getOdinOverviewDataCluster = (state: OdinRootState) => state.odin.overview.dataCluster;
const getOdinOverviewHiddenMetricsRaw = (state: OdinRootState) => state.odin.overview.hiddenMetrics;
export const getOdinOverviewShowCreatePresetDialog = (state: OdinRootState) =>
    state.odin.overview.showCreatePresetDialog;
export const getOdinOverviewUseDefaultPreset = (state: OdinRootState) =>
    state.odin.overview.useDefaultPreset;
export const getOdinOverviewPresetToRemove = (state: OdinRootState) =>
    state.odin.overview.presetToRemove;

const getOdinOverviewClusterMetricsRaw = (state: OdinRootState) =>
    state.odin.overview.clusterMetrics;

export const getOdinOverviewVisiblePresets = createSelector(
    [getSettingOdinOverviewVisiblePresets],
    (res?: Array<OdinOverviewPreset>) => {
        return res || [];
    },
);

export const getOdinOverviewDefaultPreset = createSelector(
    [getOdinOverviewVisiblePresets],
    (presets) => {
        return presets.find((item) => item.isDefault);
    },
);

export interface OdinOverviewPreset {
    name: string;
    hiddenMetricNames: Array<string>;

    isDefault?: boolean;
}

export const getOdinOverviewHiddenMetrics = createSelector(
    [
        getOdinOverviewHiddenMetricsRaw,
        getOdinOverviewUseDefaultPreset,
        getOdinOverviewDefaultPreset,
    ],
    (hiddenMetrics, useDefaultPreset, defaultPreset) => {
        if (!defaultPreset || !useDefaultPreset) {
            return hiddenMetrics;
        }

        return defaultPreset.hiddenMetricNames.reduce((acc, name) => {
            acc[name] = true;
            return acc;
        }, {} as typeof hiddenMetrics);
    },
);

export const getOdinOverviewClusterMetrics = createSelector(
    [getOdinOverviewClusterMetricsRaw, getOdinOverviewHiddenMetrics],
    (items, hiddenMetrics) => {
        const sorted = _.sortBy(items, 'display_name');
        const [hidden, visible] = _.partition(sorted, ({name}) => hiddenMetrics[name]);
        return visible.concat(hidden);
    },
);

export const getOdinLastVisitedTab = createSelector(
    makeGetSetting,
    (getSetting) => getSetting(ODIN_LAST_VISITED_TAB, NAMESPACES.GLOBAL) || OdinTab.OVERVIEW,
);
