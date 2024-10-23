import {ClusterTheme} from '../shared/yt-types';
import YT from './config/yt-config';
import UIFactory from './UIFactory';

const favicon = require('./assets/img/favicon.png');

export const favicons: Record<ClusterTheme, string> = {
    grapefruit: require('./assets/img/favicon-grapefruit.png'),
    bittersweet: require('./assets/img/favicon-bittersweet.png'),
    sunflower: require('./assets/img/favicon-sunflower.png'),
    grass: require('./assets/img/favicon-grass.png'),
    mint: require('./assets/img/favicon-mint.png'),
    aqua: require('./assets/img/favicon-aqua.png'),
    bluejeans: require('./assets/img/favicon-bluejeans.png'),
    lavander: require('./assets/img/favicon-lavander.png'),
    pinkrose: require('./assets/img/favicon-pinkrose.png'),
    lightgray: require('./assets/img/favicon-lightgray.png'),
    mediumgray: require('./assets/img/favicon-mediumgray.png'),
    darkgray: require('./assets/img/favicon-darkgray.png'),
    dornyellow: require('./assets/img/favicon-dorn-yellow.png'),
    rubber: require('./assets/img/favicon-rubber.png'),
};

export interface ClusterAppearance {
    favicon?: string;
    icon: string;
    icon2x: string;
    iconbig?: string;
}

export const defaultClusterAppearance: ClusterAppearance = {
    icon: require('./assets/img/cluster.svg'),
    icon2x: require('./assets/img/cluster-2x.svg'),
    favicon,
};

const localClusterAppearance: ClusterAppearance = {
    favicon,
    icon: require('./assets/img/ui.jpg'),
    icon2x: require('./assets/img/ui-2x.jpg'),
    iconbig: require('./assets/img/ui-big.jpg'),
};

const cache: Record<string, ClusterAppearance> = {};

export function getClusterAppearance(cluster = ''): ClusterAppearance {
    if (!cache[cluster]) {
        const {isLocalCluster, theme} = YT.clusters[cluster] ?? {};

        const item = (cache[cluster] = {
            ...(isLocalCluster ? localClusterAppearance : defaultClusterAppearance),
        });

        Object.assign(
            item,
            {favicon: favicons[theme] ?? item.favicon},
            UIFactory.getClusterAppearance(cluster),
        );
    }

    return cache[cluster];
}
