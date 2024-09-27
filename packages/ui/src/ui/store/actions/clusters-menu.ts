import axios from 'axios';
import {
    CLUSTERS_MENU_UPDATE_FILTER,
    CLUSTERS_MENU_UPDATE_VIEWMODE,
    FETCH_CLUSTER_AUTH_STATUS,
    FETCH_CLUSTER_AVAILABILITY,
    FETCH_CLUSTER_VERSIONS,
} from '../../constants/index';
import {fetchClustersAvailability} from '../../pages/odin/odin-utils';
import {
    ClustersMenuAction,
    ClustersMenuState,
} from '../../store/reducers/clusters-menu/clusters-menu';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../store/reducers';

export function updateViewMode(viewMode: ClustersMenuState['viewMode']) {
    return {type: CLUSTERS_MENU_UPDATE_VIEWMODE, data: viewMode};
}

export function updateFilter(clusterFilter: ClustersMenuState['clusterFilter']) {
    return {type: CLUSTERS_MENU_UPDATE_FILTER, data: clusterFilter};
}

type ClusterMenuThunkAction = ThunkAction<void, RootState, unknown, ClustersMenuAction>;

export function fetchClusterVersions(): ClusterMenuThunkAction {
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
                dispatch({type: FETCH_CLUSTER_VERSIONS.FAILURE});
            });
    };
}

export function fetchClusterAuthStatus(): ClusterMenuThunkAction {
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
                dispatch({type: FETCH_CLUSTER_AUTH_STATUS.FAILURE});
            });
    };
}

export function fetchClusterAvailability(): ClusterMenuThunkAction {
    return (dispatch) => {
        return fetchClustersAvailability()
            .then(({data}) => {
                dispatch({type: FETCH_CLUSTER_AVAILABILITY.SUCCESS, data});
            })
            .catch(() => {
                dispatch({type: FETCH_CLUSTER_AVAILABILITY.FAILURE});
            });
    };
}
