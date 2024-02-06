import _ from 'lodash';
import {
    FETCH_CLUSTER_AUTH_STATUS,
    FETCH_CLUSTER_AVAILABILITY,
    FETCH_CLUSTER_VERSIONS,
    UPDATE_FILTER,
    UPDATE_VIEWMODE,
} from '../../../constants/index';
import YT from '../../../config/yt-config';

export const initialState = {
    clusters: _.reduce(
        _.cloneDeep(YT?.clusters),
        (clusters, config, clusterId) => {
            config.status = 'unknown';
            clusters[clusterId] = config;
            return clusters;
        },
        {},
    ),
    viewMode: 'dashboard',
    clusterFilter: '',
};

export default (state = initialState, action) => {
    let clusters;

    switch (action.type) {
        case FETCH_CLUSTER_VERSIONS.SUCCESS:
        case FETCH_CLUSTER_VERSIONS.FAILURE: {
            const versions = _.reduce(
                action.data,
                (clusters, {id, version}) => {
                    clusters[id] = {
                        loadState: 'loaded',
                        access: version ? 'granted' : 'none',
                        version,
                    };
                    return clusters;
                },
                {},
            );
            clusters = _.merge({}, state.clusters, versions);

            return {...state, clusters};
        }

        case FETCH_CLUSTER_AVAILABILITY.SUCCESS:
        case FETCH_CLUSTER_AVAILABILITY.FAILURE: {
            const availability = _.reduce(
                action.data,
                (clusters, {id, availability}) => {
                    clusters[id] = {
                        status: availability > 0.5 ? 'available' : 'unavailable',
                    };
                    return clusters;
                },
                {},
            );
            clusters = _.merge({}, state.clusters, availability);

            return {...state, clusters};
        }

        case FETCH_CLUSTER_AUTH_STATUS.SUCCESS:
        case FETCH_CLUSTER_AUTH_STATUS.FAILURE: {
            clusters = _.merge({}, state.clusters, action.data);

            return {...state, clusters};
        }

        case UPDATE_VIEWMODE:
            return {...state, viewMode: action.data};

        case UPDATE_FILTER:
            return {...state, clusterFilter: action.data};

        default:
            return state;
    }
};
