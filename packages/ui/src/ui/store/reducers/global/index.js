import _ from 'lodash';

import MaintenancePage from '../../../containers/MaintenancePage/MaintenancePage';
import {
    UPDATE_TITLE,
    BLOCK_USER,
    BAN_USER,
    INC_NAV_BLOCKER_COUNTER,
    DEC_NAV_BLOCKER_COUNTER,
    SET_MAINTENANCE_PAGE_EVENT,
    INIT_CLUSTER_PARAMS,
    UPDATE_CLUSTER,
    LOADING_STATUS,
    LOAD_ERROR,
    SPLIT_SCREEN,
    MERGE_SCREEN,
    GLOBAL_SET_THEME,
} from '../../../constants/index';
import {GLOBAL_PARTIAL} from '../../../constants/global';

import {getClusterConfig} from '../../../utils';
import {defaultClusterUiConfig} from './cluster-ui-config';

const EMPTY_OBJECT = {};

const YT = window.YT;
const initialState = {
    title: 'Clusters',
    cluster: YT.cluster,
    /**
     * If not empty then AppNavigation should display page-items.
     * The pages which sets the field should also clear it.
     */
    rootPagesCluster: '',
    page: '',
    path: '',

    activeNavigationBlockers: 0,
    splitScreen: {
        isSplit: false,
        paneClassNames: [],
        type: '',
    },
    // scrollOffset: 0,
    blocked: false, // user may become automatically temporarily banned
    banned: false, // user may be banned by administrator
    maintenancePageEvent: null,
    ongoingPageEvents: null,
    eventsFirstUpdate: false,

    loadState: LOADING_STATUS.UNINITIALIZED,
    error: EMPTY_OBJECT,

    version: YT.parameters.version,
    schedulerVersion: null,
    login: YT.parameters.login,

    // cluster-params
    paramsLoading: false,
    paramsLoaded: false,
    paramsError: null,

    isDeveloper: false, // groups of current user
    mediumList: [],
    groups: [],
    users: undefined,
    bundles: undefined,
    accounts: [],
    poolTrees: undefined,
    clusterUiConfig: defaultClusterUiConfig,

    showLoginDialog: false,

    theme: '',
};

function updatedTitle(state, {cluster, page, path, clusters}) {
    cluster = typeof cluster !== 'undefined' ? cluster : state.cluster;
    page = typeof page !== 'undefined' ? page : state.page;
    path = typeof path !== 'undefined' ? path : state.path;

    const clusterConfig = getClusterConfig(clusters, cluster);
    const clusterName = clusterConfig.name || cluster;
    const title = _.filter([path, page, clusterName], _.identity).join(' - ');

    return {cluster, page, path, title};
}

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_TITLE:
            return {...state, ...updatedTitle(state, action.data)};

        case INC_NAV_BLOCKER_COUNTER:
            return {
                ...state,
                activeNavigationBlockers: state.activeNavigationBlockers + 1,
            };

        case DEC_NAV_BLOCKER_COUNTER: {
            const errors = state.activeNavigationBlockers;

            return {
                ...state,
                activeNavigationBlockers: errors > 0 ? errors - 1 : 0,
            };
        }

        case INIT_CLUSTER_PARAMS.REQUEST: {
            return {
                ...state,
                paramsLoading: true,
                users: undefined,
                groups: undefined,
                accounts: undefined,
                bundles: undefined,
                poolTrees: undefined,
            };
        }

        case INIT_CLUSTER_PARAMS.FAILURE: {
            return {
                ...state,
                paramsLoaded: false,
                paramsLoading: false,
                paramsError: action.data,
            };
        }

        case INIT_CLUSTER_PARAMS.SUCCESS: {
            const {mediumList, schedulerVersion, accounts, isDeveloper, clusterUiConfig, cluster} =
                action.data;

            return {
                ...state,
                accounts: _.sortBy(accounts),
                mediumList,
                isDeveloper,
                clusterUiConfig,
                paramsCluster: cluster,
                paramsLoaded: true,
                paramsLoading: false,
                paramsError: undefined,
                schedulerVersion,
            };
        }

        case BLOCK_USER:
            return {...state, blocked: true};

        case BAN_USER:
            return {...state, banned: true};

        case SET_MAINTENANCE_PAGE_EVENT: {
            const {events, isFirstUpdate} = action.data;
            const maintenancePageEvent = MaintenancePage.getNotificationWithMaintenance(events);

            return {
                ...state,
                maintenancePageEvent,
                ongoingPageEvents: events,
                eventsFirstUpdate: isFirstUpdate,
            };
        }

        case UPDATE_CLUSTER.REQUEST:
            return {
                ...state,
                maintenancePageEvent: null,
                loadState: LOADING_STATUS.LOADING,
            };

        case UPDATE_CLUSTER.FINAL_SUCCESS: {
            return {
                ...state,
                error: EMPTY_OBJECT,
                loadState: LOADING_STATUS.LOADED,
            };
        }

        case UPDATE_CLUSTER.SUCCESS: {
            const {version} = action.data;

            return {
                ...state,
                version,
            };
        }

        case UPDATE_CLUSTER.FAILURE: {
            const {error, errorType} = action.data;

            return {
                ...state,
                error: {
                    error,
                    errorType: errorType || LOAD_ERROR.GENERAL,
                },
                loadState: LOADING_STATUS.ERROR,
            };
        }

        case SPLIT_SCREEN: {
            const {paneClassNames, type} = action.data;
            const splitScreen = {isSplit: true, paneClassNames, type};

            return {...state, splitScreen};
        }

        case MERGE_SCREEN:
            return {...state, splitScreen: initialState.splitScreen};

        case GLOBAL_SET_THEME:
            return {...state, theme: action.data};

        case GLOBAL_PARTIAL:
            return {...state, ...action.data};

        default:
            return state;
    }
};
