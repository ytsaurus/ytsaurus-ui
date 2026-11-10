import {createSelector} from 'reselect';
import {YT} from '../../../config/yt-config';
import {getQueryClusters} from '../../../utils/query-tracker/settings';
import {selectClusterList} from '../slideoutMenu';
import {selectQueryTrackerInfoClusters} from './queryAco';
import {selectQueryDraftCluster} from './query';

export const selectQueryClusters = createSelector(
    [selectClusterList, selectQueryTrackerInfoClusters, selectQueryDraftCluster],
    (clusters, allowed, current) =>
        getQueryClusters(clusters, allowed, Boolean(YT.isLocalCluster), current),
);
