import _ from 'lodash';
import {ClusterConfig, YTConfig} from '../shared/yt-types';
import {getApp} from './ServerFactory';

export function getRealClustersConfig(): Pick<YTConfig, 'clusters'> {
    const {clustersConfigPath} = getApp().config;
    // eslint-disable-next-line global-require, security/detect-non-literal-require
    const {clusters} = require(clustersConfigPath) || {};
    if (!clusters) {
        throw new Error('Please make sure you have provided correct file ' + clustersConfigPath);
    }

    return {
        clusters: _.reduce(
            clusters,
            (acc, item) => {
                acc[item.id] = item;
                return acc;
            },
            {} as Record<string, ClusterConfig>,
        ),
    };
}
