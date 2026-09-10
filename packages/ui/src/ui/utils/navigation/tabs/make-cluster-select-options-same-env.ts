import {YT} from '../../../config/yt-config';

export function makeClusterSelectOptionsSameEnv(cluster: string) {
    const clusters = Object.entries(YT.clusters)
        .filter(([_, value]) => value.environment === YT.clusters[cluster].environment)
        .map(([key]) => key);
    return clusters
        .map((clusterId) => ({
            value: clusterId,
            content: clusterId,
        }))
        ?.sort((a, b) => a.value.localeCompare(b.value));
}
