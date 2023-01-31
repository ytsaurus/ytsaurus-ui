import _ from 'lodash';

import {DEFAULT_GROUP} from '../constants/cluster-menu';
import {YTConfig, ClusterConfig} from '../../shared/yt-types';

const YT = (window as any).YT as YTConfig;

export default YT;

export function getGroupedClusters(clusters = YT.clusters) {
    function sortByClusterName(clusterA: ClusterConfig, clusterB: ClusterConfig) {
        return clusterA.name > clusterB.name ? 1 : -1;
    }

    const groups = _.reduce(
        clusters,
        (groups, cluster) => {
            const currentGroup = cluster.group || DEFAULT_GROUP;
            groups[currentGroup] = groups[currentGroup] || [];
            groups[currentGroup].push(cluster);
            return groups;
        },
        {} as Record<string, Array<ClusterConfig>>,
    );

    _.each(groups, (clusters) => {
        clusters.sort(sortByClusterName);
    });

    return groups;
}
