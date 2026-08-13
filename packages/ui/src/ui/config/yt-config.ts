import forEach_ from 'lodash/forEach';
import reduce_ from 'lodash/reduce';

import {DEFAULT_GROUP} from '../constants/cluster-menu';
import {type ClusterConfig, type YTConfig} from '../../shared/yt-types';

export const YT = (window as any).YT as YTConfig;

export function getGroupedClusters(clusters = YT.clusters) {
    function sortByClusterName(clusterA: ClusterConfig, clusterB: ClusterConfig) {
        return clusterA.name > clusterB.name ? 1 : -1;
    }

    const groups = reduce_(
        clusters,
        (accGroups, cluster) => {
            const currentGroup = cluster.group || DEFAULT_GROUP;
            accGroups[currentGroup] = accGroups[currentGroup] || [];
            accGroups[currentGroup].push(cluster);
            return accGroups;
        },
        {} as Record<string, Array<ClusterConfig>>,
    );

    forEach_(groups, (clusters) => {
        clusters.sort(sortByClusterName);
    });

    return groups;
}

export const isMultiClusterInstallation = () => Object.keys(YT.clusters).length > 1;
