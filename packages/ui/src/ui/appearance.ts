import {ClusterTheme} from '../shared/yt-types';
import YT from './config/yt-config';
import UIFactory from './UIFactory';

const favicon = require('../../img/favicon.png');

export const favicons: Record<ClusterTheme, string> = {
    grapefruit: require('../../img/favicon-grapefruit.png'),
    bittersweet: require('../../img/favicon-bittersweet.png'),
    sunflower: require('../../img/favicon-sunflower.png'),
    grass: require('../../img/favicon-grass.png'),
    mint: require('../../img/favicon-mint.png'),
    aqua: require('../../img/favicon-aqua.png'),
    bluejeans: require('../../img/favicon-bluejeans.png'),
    lavander: require('../../img/favicon-lavander.png'),
    pinkrose: require('../../img/favicon-pinkrose.png'),
    lightgray: require('../../img/favicon-lightgray.png'),
    mediumgray: require('../../img/favicon-mediumgray.png'),
    darkgray: require('../../img/favicon-darkgray.png'),
};

export interface ClusterAppearance {
    favicon?: string;
    icon: string;
    icon2x: string;
    iconbig?: string;
}

export const defaultClusterAppearance: ClusterAppearance = {
    icon: require('../../img/cluster.svg'),
    icon2x: require('../../img/cluster-2x.svg'),
    favicon,
};

const localClusterAppearance: ClusterAppearance = {
    favicon,
    icon: require('../../img/ui.jpg'),
    icon2x: require('../../img/ui-2x.jpg'),
    iconbig: require('../../img/ui-big.jpg'),
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
