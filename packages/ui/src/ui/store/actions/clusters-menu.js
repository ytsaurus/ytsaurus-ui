import axios from 'axios';
import {
    FETCH_CLUSTER_AUTH_STATUS,
    FETCH_CLUSTER_AVAILABILITY,
    FETCH_CLUSTER_VERSIONS,
    UPDATE_FILTER,
    UPDATE_VIEWMODE,
} from '../../constants/index';
import {fetchClustersAvailability} from '../../pages/odin/odin-utils';

export function updateViewMode(viewMode) {
    return {type: UPDATE_VIEWMODE, data: viewMode};
}

export function updateFilter(clusterFilter) {
    return {type: UPDATE_FILTER, data: clusterFilter};
}

export function fetchClusterVersions() {
    return (dispatch) => {
        return axios
            .request({
                method: 'get',
                url: '/api/clusters/versions',
            })
            .then(({data}) => {
                dispatch({type: FETCH_CLUSTER_VERSIONS.SUCCESS, data});
            })
            .catch(() => {
                dispatch({type: FETCH_CLUSTER_VERSIONS.FAILURE, data: {}});
            });
    };
}

export function fetchClusterAuthStatus() {
    return (dispatch) => {
        return axios
            .request({
                method: 'get',
                url: '/api/clusters/auth-status',
            })
            .then(({data}) => {
                dispatch({type: FETCH_CLUSTER_AUTH_STATUS.SUCCESS, data});
            })
            .catch(() => {
                dispatch({type: FETCH_CLUSTER_AUTH_STATUS.FAILURE, data: {}});
            });
    };
}

export function fetchClusterAvailability() {
    return (dispatch) => {
        return fetchClustersAvailability()
            .then(({data}) => {
                dispatch({type: FETCH_CLUSTER_AVAILABILITY.SUCCESS, data});
            })
            .catch(() => {
                dispatch({
                    type: FETCH_CLUSTER_AVAILABILITY.FAILURE,
                    data: {},
                });
            });
    };
}
