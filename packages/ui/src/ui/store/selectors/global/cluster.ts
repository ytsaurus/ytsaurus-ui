import {createSelector} from 'reselect';

import type {ClusterConfig, ClusterUiConfig} from '../../../../shared/yt-types';

import {YT} from '../../../config/yt-config';
import {getConfigData, uiSettings} from '../../../config/ui-settings';

import {RootState} from '../../../store/reducers';
import {getClusterConfig} from '../../../utils';
import {QueryEngine} from '../../../../shared/constants/engines';
import {mergeUiSettings} from '../../../../shared/utils/merge-ui-settings';
import {selectIsDeveloper} from './is-developer';
import {selectSpytEnginesInfo} from '../query-tracker/queryTrackerEnginesInfo';

export const selectCluster = (state: RootState): string => state.global.cluster || '';

const selectClusterUiConfigRaw = (state: RootState) => state.global.clusterUiConfig;

const selectClusterUiDevConfigRaw = (state: RootState) => state.global.clusterUiDevConfig;

export const selectClusterUiConfig = createSelector(
    [selectClusterUiConfigRaw, selectClusterUiDevConfigRaw, selectIsDeveloper],
    (clusterUiConfig, clusterUiDevConfig, isDeveloper): Partial<ClusterUiConfig> => {
        return isDeveloper ? {...clusterUiConfig, ...clusterUiDevConfig} : clusterUiConfig;
    },
);

export const selectMergedUiSettings = createSelector([selectClusterUiConfig], (uiConfig) => {
    return mergeUiSettings({uiSettings, uiConfig});
});

export const getClusterConfigByName = (cluster: string): ClusterConfig => {
    return getClusterConfig(YT.clusters, cluster);
};

export const selectCurrentClusterConfig = createSelector(
    [selectCluster],
    (cluster): ClusterConfig => {
        return getClusterConfigByName(cluster);
    },
);

export function getClusterProxy(clusterConfig: ClusterConfig): string {
    const allowYtTvmApi = !getConfigData().ytApiUseCORS;
    if (allowYtTvmApi) {
        return `${window.location.host}/api/yt/${clusterConfig.id}`;
    }
    return clusterConfig.proxy;
}

export const selectClusterSupportedEngines = createSelector(
    [selectSpytEnginesInfo, selectClusterUiConfig, selectCluster],
    (spytEngine, {chyt_controller_base_url}, cluster): Record<QueryEngine, boolean> => {
        const clusters = spytEngine?.clusters;

        return {
            yql: true,
            chyt: Boolean(chyt_controller_base_url),
            spyt: clusters ? clusters.includes(cluster) : true,
            ql: true,
        };
    },
);

export const selectClusterUiConfigEnablePerAccountTabletAccounting = (state: RootState) => {
    return selectClusterUiConfig(state).enable_per_account_tablet_accounting ?? false;
};

export const selectClusterUiConfigEnablePerBundleTabletAccounting = (state: RootState) => {
    return selectClusterUiConfig(state).enable_per_bundle_tablet_accounting ?? true;
};

export const selectClusterUiConfigBundleAccountingHelpLink = (state: RootState) => {
    return selectClusterUiConfig(state).per_bundle_accounting_help_link;
};

export const selectHttpProxyVersion = createSelector(
    [selectCluster, (state: RootState) => state.global.version],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const selectGlobalSchedulerVersion = createSelector(
    [selectCluster, (state: RootState) => state.global.schedulerVersion],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const getGlobalMasterVersion = createSelector(
    [selectCluster, (state: RootState) => state.global.masterVersion],
    (cluster, version) => {
        return cluster ? version : '';
    },
);
