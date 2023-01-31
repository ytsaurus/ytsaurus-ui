import axios from 'axios';
import {
    UPDATE_FILTER,
    UPDATE_VIEWMODE,
    FETCH_CLUSTER_AVAILABILITY,
    FETCH_CLUSTER_VERSIONS,
} from '../../constants/index';
import UIFactory from '../../UIFactory';

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

export function fetchClusterAvailability() {
    return (dispatch) => {
        return UIFactory.loadClustersAvailability()
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
