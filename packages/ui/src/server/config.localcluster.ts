import {YT_LOCAL_CLUSTER_ID} from './constants';
import {ClusterConfig, YTConfig} from '../shared/yt-types';
import {getApp} from './ServerFactory';
import {ytAuthConfigFromEnv} from './utils/configs/auth-config-from-env';

const localProxy = process.env.PROXY;

const localThemes: Record<string, ClusterConfig['theme']> = {
    [YT_LOCAL_CLUSTER_ID]: 'grapefruit',
    [localProxy!]: 'grapefruit',
};

const {allowPasswordAuth} = ytAuthConfigFromEnv;

function makeClusterConfig(id: string, name: string, proxy: string): ClusterConfig {
    return {
        ...getApp().config?.localmodeClusterConfig,

        id,
        name,
        proxy,
        authentication: allowPasswordAuth ? 'basic' : 'none',
        secure: false,
        theme: localThemes[id] ?? 'mint',
        description: 'Local',
        environment: 'development',
    };
}

function makeLocalClusters() {
    const localClusters: Record<string, ClusterConfig> = localProxy
        ? {
              [YT_LOCAL_CLUSTER_ID]: makeClusterConfig(YT_LOCAL_CLUSTER_ID, 'Local', localProxy),
              [localProxy]: makeClusterConfig(localProxy, 'Local as remote', localProxy),
          }
        : {};
    return localClusters;
}

export function makeLocalModeConfig(
    proxy?: string,
): Pick<YTConfig, 'clusters' | 'environment' | 'isLocalCluster'> {
    const proxyClusters: Record<string, ClusterConfig> =
        proxy && proxy !== YT_LOCAL_CLUSTER_ID
            ? {[proxy]: makeClusterConfig(proxy, 'Local as remote', proxy)}
            : {};

    return {
        isLocalCluster: true,
        environment: 'localmode',
        clusters: {
            ...makeLocalClusters(),
            ...proxyClusters,
        },
    };
}
