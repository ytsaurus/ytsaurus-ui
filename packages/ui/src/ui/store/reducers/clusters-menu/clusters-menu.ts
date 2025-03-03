import {Action} from 'redux';

import cloneDeep_ from 'lodash/cloneDeep';
import reduce_ from 'lodash/reduce';

import {
    CLUSTERS_MENU_UPDATE_FILTER,
    CLUSTERS_MENU_UPDATE_VIEWMODE,
    FETCH_CLUSTER_AUTH_STATUS,
    FETCH_CLUSTER_AVAILABILITY,
    FETCH_CLUSTER_VERSIONS,
} from '../../../constants/index';
import {YT} from '../../../config/yt-config';
import {ValueOf} from '../../../../@types/types';
import {ActionD} from '../../../types';

export type ClustersMenuState = {
    clusters: Record<string, ClusterConfigWithStatus>;
    clusterFilter: string;
    viewMode: 'dashboard' | 'table';
};

export type ClusterConfigWithStatus = ValueOf<(typeof YT)['clusters']> & {
    status: 'unknown' | 'available' | 'unavailable';
    loadState?: 'loaded';
    access?: 'granted' | 'none';
    version?: string;
    authorized?: boolean;
};

export const initialState: ClustersMenuState = {
    clusters: reduce_(
        cloneDeep_(YT?.clusters),
        (acc, clusterConfig, clusterId) => {
            acc[clusterId] = {
                ...clusterConfig,
                status: 'unknown',
            };
            return acc;
        },
        {} as ClustersMenuState['clusters'],
    ),
    viewMode: 'dashboard',
    clusterFilter: '',
};

export default (state = initialState, action: ClustersMenuAction) => {
    switch (action.type) {
        case FETCH_CLUSTER_VERSIONS.SUCCESS: {
            const newClusters = reduce_(
                action.data,
                (acc, {id, version}) => {
                    if (acc[id]) {
                        acc[id] = {
                            ...acc[id],
                            loadState: 'loaded',
                            access: version ? 'granted' : 'none',
                            version,
                        };
                    }
                    return acc;
                },
                {...state.clusters},
            );

            return {...state, clusters: newClusters};
        }

        case FETCH_CLUSTER_AVAILABILITY.SUCCESS: {
            const newClusters = reduce_(
                action.data,
                (acc, {id, availability}) => {
                    if (acc[id]) {
                        acc[id] = {
                            ...acc[id],
                            status: availability! > 0.5 ? 'available' : 'unavailable',
                        };
                    }
                    return acc;
                },
                {...state.clusters},
            );

            return {...state, clusters: newClusters};
        }

        case FETCH_CLUSTER_AUTH_STATUS.SUCCESS: {
            return {
                ...state,
                clusters: reduce_(
                    action.data,
                    (acc, partialConfig, id) => {
                        if (acc[id]) {
                            acc[id] = {...acc[id], ...partialConfig};
                        }
                        return acc;
                    },
                    {...state.clusters},
                ),
            };
        }

        case CLUSTERS_MENU_UPDATE_VIEWMODE:
            return {...state, viewMode: action.data};

        case CLUSTERS_MENU_UPDATE_FILTER:
            return {...state, clusterFilter: action.data};

        case FETCH_CLUSTER_VERSIONS.FAILURE:
        case FETCH_CLUSTER_AUTH_STATUS.FAILURE:
        case FETCH_CLUSTER_AVAILABILITY.FAILURE:
        default:
            return state;
    }
};

export type ClustersMenuAction =
    | Action<typeof FETCH_CLUSTER_AUTH_STATUS.FAILURE>
    | Action<typeof FETCH_CLUSTER_VERSIONS.FAILURE>
    | Action<typeof FETCH_CLUSTER_AVAILABILITY.FAILURE>
    | ActionD<typeof FETCH_CLUSTER_VERSIONS.SUCCESS, Record<string, {id: string; version: string}>>
    | ActionD<typeof FETCH_CLUSTER_AVAILABILITY.SUCCESS, Array<{id: string; availability?: number}>>
    | ActionD<
          typeof FETCH_CLUSTER_AUTH_STATUS.SUCCESS,
          Record<string, Pick<ClusterConfigWithStatus, 'authorized'>>
      >
    | ActionD<typeof CLUSTERS_MENU_UPDATE_VIEWMODE, ClustersMenuState['viewMode']>
    | ActionD<typeof CLUSTERS_MENU_UPDATE_FILTER, ClustersMenuState['clusterFilter']>;
