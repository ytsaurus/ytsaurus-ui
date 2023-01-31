import cn from 'bem-cn-lite';
import YT from '../../config/yt-config';

import './ClusterColor.scss';
const clusterColorBlock = cn('cluster-color');

export function useClusterColorClassName(cluster?: string) {
    const {theme} = YT.clusters[cluster ?? ''] || {};
    return clusterColorBlock({theme});
}
