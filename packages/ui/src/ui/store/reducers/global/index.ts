import {Action} from 'redux';

import filter_ from 'lodash/filter';
import sortBy_ from 'lodash/sortBy';

// @ts-expect-error
import {LOCATION_POP} from 'redux-location-state/lib/constants';

import {YT} from '../../../config/yt-config';
import {
    BAN_USER,
    BLOCK_USER,
    DEC_NAV_BLOCKER_COUNTER,
    GLOBAL_SET_THEME,
    INC_NAV_BLOCKER_COUNTER,
    INIT_CLUSTER_PARAMS,
    LOADING_STATUS,
    LoadingStatus,
    MERGE_SCREEN,
    PRELOAD_ERROR,
    PreloadErrorType,
    SPLIT_SCREEN,
    UPDATE_CLUSTER,
    UPDATE_TITLE,
} from '../../../constants/index';
import {GLOBAL_PARTIAL} from '../../../constants/global';
import {EMPTY_OBJECT} from '../../../constants/empty';

import {getClusterConfig} from '../../../utils';
import {defaultClusterUiConfig} from './cluster-ui-config';
import {ActionD, YTError} from '../../../types';
import {AuthWay} from '../../../../shared/constants';
import {ClusterConfig, ClusterUiConfig, CypressNode, RawVersion} from '../../../../shared/yt-types';
import {MaintenanceEvent} from '../index.main';

export type PoolTree = {
    [K in string]: PoolTree;
};

export type GlobalState = {
    title: string;
    page?: string;
    path?: string;

    cluster?: string;
    rootPagesCluster: string;

    activeNavigationBlockers: number;

    splitScreen: {
        isSplit: boolean;
        paneClassNames: Array<string>;
        type: string;
    };

    blocked: boolean; // user may become automatically temporarily banned
    banned: boolean; // user may be banned by administrator

    ongoingEvents: {cluster: string; events: Array<MaintenanceEvent>};

    loadState: LoadingStatus;
    error?: {error?: YTError; errorType?: PreloadErrorType};

    version?: RawVersion;
    masterVersion?: RawVersion;
    schedulerVersion?: RawVersion;

    login: string;
    authWay: AuthWay;

    // cluster-params
    paramsCluster?: string;
    paramsLoading: boolean;
    paramsLoaded: boolean;
    paramsError: YTError | undefined;

    isDeveloper: boolean; // groups of current user
    mediumList: Array<string>;
    groups?: Array<CypressNode<{upravlyator_managed: boolean}, string>>;
    users?: Array<CypressNode<{upravlyator_managed: boolean}, string>>;
    bundles?: Array<string>;
    accounts?: Array<string>;
    defaultPoolTree?: string;
    poolTrees?: PoolTree;
    clusterUiConfig: Partial<ClusterUiConfig>;

    showLoginDialog: boolean;

    theme: 'dark' | 'light' | '';

    asideHeaderWidth: number;

    allowedExperimentalPages?: undefined | Array<string>;

    enableMaxContentWidth: boolean;

    ytAuthCluster?: string;

    _ym_debug?: string;
    rumDebug?: string;
};

const initialState: GlobalState = {
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

    blocked: false, // user may become automatically temporarily banned
    banned: false, // user may be banned by administrator
    ongoingEvents: {cluster: '', events: []},

    loadState: LOADING_STATUS.UNINITIALIZED,
    error: EMPTY_OBJECT,

    version: YT.parameters.version,
    schedulerVersion: undefined,
    masterVersion: undefined,
    login: YT.parameters.login,
    authWay: YT.parameters.authWay,

    // cluster-params
    paramsLoading: false,
    paramsLoaded: false,
    paramsError: undefined,

    isDeveloper: false, // groups of current user
    mediumList: [],
    groups: [],
    users: undefined,
    bundles: undefined,
    accounts: [],
    defaultPoolTree: undefined,
    poolTrees: undefined,
    clusterUiConfig: defaultClusterUiConfig,

    showLoginDialog: false,

    theme: '',

    asideHeaderWidth: 56,

    allowedExperimentalPages: undefined,

    enableMaxContentWidth: true,
};

function updatedTitle(
    state: GlobalState,
    {
        cluster,
        page,
        path,
        clusters,
    }: Pick<GlobalState, 'cluster' | 'page' | 'path'> & {clusters: Record<string, ClusterConfig>},
) {
    cluster = typeof cluster !== 'undefined' ? cluster : state.cluster;
    page = typeof page !== 'undefined' ? page : state.page;
    path = typeof path !== 'undefined' ? path : state.path;

    const clusterConfig = getClusterConfig(clusters, cluster ?? '');
    const clusterName = clusterConfig.name || cluster;
    const title = filter_([path, page, clusterName], Boolean).join(' - ');

    return {cluster, page, path, title};
}

export default (state = initialState, action: GloablStateAction): GlobalState => {
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
            const {
                mediumList,
                schedulerVersion,
                masterVersion,
                accounts,
                isDeveloper,
                clusterUiConfig,
                cluster,
            } = action.data;

            return {
                ...state,
                accounts: sortBy_(accounts),
                mediumList,
                isDeveloper,
                clusterUiConfig,
                paramsCluster: cluster,
                paramsLoaded: true,
                paramsLoading: false,
                paramsError: undefined,
                schedulerVersion,
                masterVersion,
            };
        }

        case BLOCK_USER:
            return {...state, blocked: true};

        case BAN_USER:
            return {...state, banned: true};

        case UPDATE_CLUSTER.REQUEST:
            return {
                ...state,
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
                    errorType: errorType || PRELOAD_ERROR.GENERAL,
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

        case LOCATION_POP:
            return {...state, showLoginDialog: false};

        default:
            return state;
    }
};

export type GloablStateAction =
    | Action<
          | typeof INC_NAV_BLOCKER_COUNTER
          | typeof DEC_NAV_BLOCKER_COUNTER
          | typeof INIT_CLUSTER_PARAMS.REQUEST
          | typeof BLOCK_USER
          | typeof BAN_USER
          | typeof UPDATE_CLUSTER.REQUEST
          | typeof UPDATE_CLUSTER.FINAL_SUCCESS
          | typeof MERGE_SCREEN
      >
    | ActionD<typeof INIT_CLUSTER_PARAMS.FAILURE, GlobalState['paramsError']>
    | ActionD<
          typeof INIT_CLUSTER_PARAMS.SUCCESS,
          Pick<
              GlobalState,
              | 'mediumList'
              | 'schedulerVersion'
              | 'masterVersion'
              | 'accounts'
              | 'isDeveloper'
              | 'clusterUiConfig'
              | 'cluster'
          >
      >
    | ActionD<
          typeof UPDATE_TITLE,
          Pick<GlobalState, 'cluster' | 'page' | 'path'> & {clusters: Record<string, ClusterConfig>}
      >
    | ActionD<typeof UPDATE_CLUSTER.SUCCESS, Pick<GlobalState, 'version'>>
    | ActionD<typeof UPDATE_CLUSTER.FAILURE, Required<GlobalState>['error']>
    | ActionD<typeof SPLIT_SCREEN, GlobalState['splitScreen']>
    | ActionD<typeof GLOBAL_SET_THEME, GlobalState['theme']>
    | ActionD<typeof GLOBAL_PARTIAL, Partial<GlobalState>>;
