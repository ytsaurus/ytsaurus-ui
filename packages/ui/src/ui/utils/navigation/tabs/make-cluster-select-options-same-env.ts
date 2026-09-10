import {YT} from '../../../config/yt-config';

export function makeClusterSelectOptionsSameEnv(cluster: string) {
    const clusters = Object.entries(YT.clusters)
        .filter(([_, value]) => value.environment === YT.clusters[cluster].environment)
        .map(([key]) => key);
    return clusters
        .map((name) => ({
            value: name,
            content: name,
        }))
        ?.sort((a, b) => a.value.localeCompare(b.value));
}
