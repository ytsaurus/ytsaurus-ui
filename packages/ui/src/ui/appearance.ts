import {YT_LOCAL_CLUSTER_ID} from '../shared/constants';
import { ClusterAppearance } from '../shared/yt-types';
import UIFactory from './UIFactory';

const favicon = require('../../img/favicon.png');

export const defaultClusterAppearance: ClusterAppearance = {
    icon: require('../../img/cluster.svg'),
    icon2x: require('../../img/cluster-2x.svg'),
    iconAvatar: require('../../img/placeholder.svg'),
    favicon,
};

const localClusterAppearance: ClusterAppearance = {
    favicon,
    icon: require('../../img/ui.jpg'),
    icon2x: require('../../img/ui-2x.jpg'),
    iconAvatar: require('../../img/ui-2x.jpg'),
    iconbig: require('../../img/ui-big.jpg'),
};

export function getClusterAppearance(cluster?: string): ClusterAppearance {
    if (cluster === YT_LOCAL_CLUSTER_ID) {
        return localClusterAppearance;
    }
    return {
        ...defaultClusterAppearance,
        ...(UIFactory.getClusterAppearance(cluster) || {}),
    };
}
