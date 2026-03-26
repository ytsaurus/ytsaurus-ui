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

export const getCluster = (state: RootState): string => state.global.cluster || '';

const getClusterUiConfigRaw = (state: RootState) => state.global.clusterUiConfig;

const getClusterUiDevConfigRaw = (state: RootState) => state.global.clusterUiDevConfig;

export const getClusterUiConfig = createSelector(
    [getClusterUiConfigRaw, getClusterUiDevConfigRaw, selectIsDeveloper],
    (clusterUiConfig, clusterUiDevConfig, isDeveloper): Partial<ClusterUiConfig> => {
        return isDeveloper ? {...clusterUiConfig, ...clusterUiDevConfig} : clusterUiConfig;
    },
);

export const getMergedUiSettings = createSelector([getClusterUiConfig], (uiConfig) => {
    return mergeUiSettings({uiSettings, uiConfig});
});

export const getClusterConfigByName = (cluster: string): ClusterConfig => {
    return getClusterConfig(YT.clusters, cluster);
};

export const getCurrentClusterConfig = createSelector([getCluster], (cluster): ClusterConfig => {
    return getClusterConfigByName(cluster);
});

export function getClusterProxy(clusterConfig: ClusterConfig): string {
    const allowYtTvmApi = !getConfigData().ytApiUseCORS;
    if (allowYtTvmApi) {
        return `${window.location.host}/api/yt/${clusterConfig.id}`;
    }
    return clusterConfig.proxy;
}

export const getClusterSupportedEngines = createSelector(
    [selectSpytEnginesInfo, getClusterUiConfig, getCluster],
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

export const getClusterUiConfigEnablePerAccountTabletAccounting = (state: RootState) => {
    return getClusterUiConfig(state).enable_per_account_tablet_accounting ?? false;
};

export const getClusterUiConfigEnablePerBundleTabletAccounting = (state: RootState) => {
    return getClusterUiConfig(state).enable_per_bundle_tablet_accounting ?? true;
};

export const getClusterUiConfigBundleAccountingHelpLink = (state: RootState) => {
    return getClusterUiConfig(state).per_bundle_accounting_help_link;
};

export const getHttpProxyVersion = createSelector(
    [getCluster, (state: RootState) => state.global.version],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const getGlobalSchedulerVersion = createSelector(
    [getCluster, (state: RootState) => state.global.schedulerVersion],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const getGlobalMasterVersion = createSelector(
    [getCluster, (state: RootState) => state.global.masterVersion],
    (cluster, version) => {
        return cluster ? version : '';
    },
);
