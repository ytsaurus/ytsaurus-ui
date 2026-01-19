import {createSelector} from 'reselect';

import type {ClusterConfig} from '../../../../shared/yt-types';

import {YT} from '../../../config/yt-config';
import {getConfigData} from '../../../config/ui-settings';

import {RootState} from '../../../store/reducers';
import {getClusterConfig} from '../../../utils';
import {QueryEngine} from '../../../../shared/constants/engines';

export const getCluster = (state: RootState): string => state.global.cluster || '';
export const getClusterUiConfig = (state: RootState) => state.global.clusterUiConfig;

export const getCurrentClusterConfig = createSelector([getCluster], (cluster): ClusterConfig => {
    return getClusterConfig(YT.clusters, cluster);
});

export function getClusterProxy(clusterConfig: ClusterConfig): string {
    const allowYtTvmApi = !getConfigData().ytApiUseCORS;
    if (allowYtTvmApi) {
        return `${window.location.host}/api/yt/${clusterConfig.id}`;
    }
    return clusterConfig.proxy;
}

export const getClusterSupportedEngines = (state: RootState): Record<QueryEngine, boolean> => {
    const {chyt_controller_base_url, livy_controller_base_url} = state.global.clusterUiConfig;
    return {
        yql: true,
        chyt: Boolean(chyt_controller_base_url),
        spyt: Boolean(livy_controller_base_url),
        ql: true,
    };
};

export const getClusterUiConfigEnablePerAccountTabletAccounting = (state: RootState) => {
    return state.global.clusterUiConfig.enable_per_account_tablet_accounting ?? false;
};
export const getClusterUiConfigEnablePerBundleTabletAccounting = (state: RootState) =>
    state.global.clusterUiConfig.enable_per_bundle_tablet_accounting ?? true;
export const getClusterUiConfigBundleAccountingHelpLink = (state: RootState) =>
    state.global.clusterUiConfig.per_bundle_accounting_help_link;

export function getClusterConfigByName(clusterName: string): ClusterConfig {
    return getClusterConfig(YT.clusters, clusterName);
}

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
