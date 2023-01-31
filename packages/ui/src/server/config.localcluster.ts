import _ from 'lodash';
import {YT_LOCAL_CLUSTER_ID} from '../shared/constants';
import {ClusterConfig, YTConfig} from '../shared/yt-types';

const localProxy = process.env.PROXY;

const localThemes: Record<string, ClusterConfig['theme']> = {
    ui: 'grapefruit',
    [localProxy!]: 'grapefruit',
};

function makeClusterConfig(id: string, name: string, proxy: string): ClusterConfig {
    return {
        id,
        name,
        proxy,
        authentication: 'none',
        secure: false,
        theme: localThemes[id] ?? 'mint',
        description: 'Local',
        environment: 'development',
    };
}

const localClusters: Record<string, ClusterConfig> = localProxy
    ? {
          ui: makeClusterConfig(YT_LOCAL_CLUSTER_ID, 'Local', localProxy),
          [localProxy]: makeClusterConfig(localProxy, 'Local as remote', localProxy),
      }
    : {};

export function makeLocalModeConfig(
    proxy?: string,
): Pick<YTConfig, 'clusters' | 'environment' | 'isLocalCluster'> {
    const proxyClusters: Record<string, ClusterConfig> =
        proxy && proxy !== YT_LOCAL_CLUSTER_ID
            ? {[proxy]: makeClusterConfig(proxy, 'Local', proxy)}
            : {};

    return {
        isLocalCluster: true,
        environment: 'localmode',
        clusters: {
            ...localClusters,
            ...proxyClusters,
        },
    };
}
