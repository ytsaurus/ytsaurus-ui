import partition_ from 'lodash/partition';
import sortBy_ from 'lodash/sortBy';

import {createSelector} from 'reselect';
import {getSettingOdinOverviewVisiblePresets} from './index';
import {RootState} from '../../../store/reducers';
import {makeGetSetting} from '../../../store/selectors/settings';
import {OdinTab} from '../odin-constants';
import {ODIN_LAST_VISITED_TAB} from '../odin-settings';
import {NAMESPACES} from '../../../../shared/constants/settings';

export const getOdinOverviewTimeFromFilter = (state: RootState) =>
    state.odin.overview.timeFromFilter;
export const getOdinOverviewTimeFrom = (state: RootState) => state.odin.overview.timeFrom;
export const getOdinOverviewTimeTo = (state: RootState) => state.odin.overview.timeTo;
export const getOdinOverviewLoading = (state: RootState) => state.odin.overview.loading;
export const getOdinOverviewData = (state: RootState) => state.odin.overview.data;
export const getOdinOverviewDataCluster = (state: RootState) => state.odin.overview.dataCluster;
const getOdinOverviewHiddenMetricsRaw = (state: RootState) => state.odin.overview.hiddenMetrics;
export const getOdinOverviewShowCreatePresetDialog = (state: RootState) =>
    state.odin.overview.showCreatePresetDialog;
export const getOdinOverviewUseDefaultPreset = (state: RootState) =>
    state.odin.overview.useDefaultPreset;
export const getOdinOverviewPresetToRemove = (state: RootState) =>
    state.odin.overview.presetToRemove;

const getOdinOverviewClusterMetricsRaw = (state: RootState) => state.odin.overview.clusterMetrics;

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

        return defaultPreset.hiddenMetricNames.reduce(
            (acc, name) => {
                acc[name] = true;
                return acc;
            },
            {} as typeof hiddenMetrics,
        );
    },
);

export const getOdinOverviewClusterMetrics = createSelector(
    [getOdinOverviewClusterMetricsRaw, getOdinOverviewHiddenMetrics],
    (items, hiddenMetrics) => {
        const sorted = sortBy_(items, 'display_name');
        const [hidden, visible] = partition_(sorted, ({name}) => hiddenMetrics[name]);
        return visible.concat(hidden);
    },
);

export const getOdinLastVisitedTab = createSelector(
    makeGetSetting,
    (getSetting) => getSetting(ODIN_LAST_VISITED_TAB, NAMESPACES.GLOBAL) || OdinTab.OVERVIEW,
);
