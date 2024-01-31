import {YT_LOCAL_CLUSTER_ID} from '../../shared/constants';
import {ClusterConfig, YTConfig} from '../../shared/yt-types';
import {makeLocalModeConfig} from '../config.localcluster';
import {getRealClustersConfig} from '../config.realcluster';
import ServerFactory, {getApp} from '../ServerFactory';
import {isLocalModeByEnvironment} from '../utils';

/*
  Gets config file, which can be either
  * the file containing all real clusters, or
  * the file containing config of a local cluster, with the proxy address either
    * defaulting to `process.env.PROXY` which corresponds to the case of a local interface paired with local cluster
    * provided explicitly which corresponds to a local cluster paired with the main interface running in cloud platform.
 */
function getClientConfig(
    proxy?: string,
): Pick<YTConfig, 'clusters' | 'isLocalCluster' | 'environment'> {
    if ((proxy && getApp().config.ytAllowRemoteLocalProxy) || isLocalModeByEnvironment()) {
        return makeLocalModeConfig(proxy);
    } else {
        return getRealClustersConfig();
    }
}

export function getClustersFromConfig() {
    return getClientConfig().clusters;
}

/*
  Gets particular cluster config for `cluster` name, which is either
  * a real cluster name
  * a local cluster pseudo-name
  * an address of a yt-local proxy running in some sandbox
 */
export function getClusterConfig(ytAuthCluster?: string) {
    const ytConfig = getClientConfig();
    if (!ytAuthCluster) {
        return {ytConfig};
    }
    const {clusters} = ytConfig;
    if (Object.hasOwnProperty.call(clusters, ytAuthCluster)) {
        return {
            ytConfig,
            clusterConfig: applyInternalProxy(clusters[ytAuthCluster]),
        };
    } else if (ServerFactory.isLocalClusterId(ytAuthCluster)) {
        const config = getClientConfig(ytAuthCluster);
        return {
            ytConfig: config,
            clusterConfig: applyInternalProxy(config.clusters[ytAuthCluster]),
        };
    } else {
        return {ytConfig};
    }
}

/**
 * PROXY_INTERNAL environment variable should be applied only for 'ui' cluster.
 * Do not use `isLocalClusterId(...)` in the function!
 */
function applyInternalProxy(clusterConfig: ClusterConfig) {
    const internalProxyName = process.env.PROXY_INTERNAL;
    if (!internalProxyName || clusterConfig.id !== YT_LOCAL_CLUSTER_ID) {
        return clusterConfig;
    }
    return {
        ...clusterConfig,
        proxy: internalProxyName,
    };
}
