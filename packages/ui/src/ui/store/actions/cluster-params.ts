import axios, {type AxiosResponse} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import Cookies from 'js-cookie';

import {getBatchError} from '../../../shared/utils/error';

import ypath from '../../common/thor/ypath';
import {checkIsDeveloper} from '../../../shared/utils/check-permission';
import {INIT_CLUSTER_PARAMS, PRELOAD_ERROR, UPDATE_CLUSTER} from '../../constants/index';
import {getXsrfCookieName} from '../../utils';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../constants/utils';
import {
    isRecentClustersFirst,
    isRecentPagesFirst,
    shouldUsePreserveState,
} from '../../store/selectors/settings';
import {rumLogError} from '../../rum/rum-counter';
import {RumWrapper, YTApiId} from '../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../rum/rum-measure-types';
import {wrapApiPromiseByToaster} from '../../utils/utils';
import {type BatchResultsItem, type RawVersion} from '../../../shared/yt-types';
import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../store/reducers';
import {YT} from '../../config/yt-config';
import {GLOBAL_PARTIAL} from '../../constants/global';
import {type FIX_MY_TYPE, type YTError} from '../../../@types/types';
import {initYTApiClusterParams} from '../../common/yt-api';
import {updateTitle} from './global';
import {reloadUserSettings} from './settings';
import {joinMenuItemsAction, splitMenuItemsAction, trackVisit} from './menu';
import {toaster} from '../../utils/toaster';

function handleUiConfigError(path: string, error: any, type?: string) {
    rumLogError(
        {
            level: 'warn',
            type,
            message: `${path} cannot be loaded, some ui features might be not available`,
            block: path,
        },
        error,
    );
}

export function prepareClusterUiConfig(uiConfig: BatchResultsItem, uiDevConfig: BatchResultsItem) {
    if (uiConfig.error && uiConfig.error.code !== yt.codes.NODE_DOES_NOT_EXIST) {
        handleUiConfigError('//sys/@ui_config', uiConfig.error);
        toaster.add({
            name: 'get-ui_config',
            theme: 'danger',
            autoHiding: false,
            title: 'Failed to load //sys/@ui_config',
            content:
                'Some UI features might be not available. ' +
                'Try to reload the page. ' +
                'If the problem persists please report it via Bug Reporter.',
        });
    }
    if (uiDevConfig.error && uiDevConfig.error.code !== yt.codes.NODE_DOES_NOT_EXIST) {
        handleUiConfigError('//sys/@ui_config_dev_overrides', uiDevConfig.error);
    }
    return [uiConfig.output || {}, uiDevConfig.output || {}];
}

type GlobalThunkAction<T = unknown> = ThunkAction<T, RootState, any, FIX_MY_TYPE>;

export function getClusterParams(
    rumId: RumWrapper<typeof RumMeasureTypes.CLUSTER_PARAMS>,
    cluster: string,
) {
    return wrapApiPromiseByToaster(
        rumId.fetch(
            YTApiId.clusterParams,
            axios.request({
                url: '/api/cluster-params/' + cluster,
                method: 'GET',
            }),
        ),
        {
            skipSuccessToast: true,
            toasterName: 'cluster_initialization_failure',
            errorTitle: 'Cluster initialization failure',
            errorContent: 'An error occured',
        },
    );
}

export function initClusterParams(cluster: string): GlobalThunkAction<Promise<void>> {
    return (dispatch) => {
        dispatch({
            type: INIT_CLUSTER_PARAMS.REQUEST,
        });

        const rumId = new RumWrapper(cluster, RumMeasureTypes.CLUSTER_PARAMS);

        return getClusterParams(rumId, cluster)
            .then(({data}) => {
                const {mediumList, schedulerVersion, masterVersion, uiConfig, uiDevConfig} = data;
                const error = getBatchError([mediumList], 'Cluster initialization failure');
                if (error) {
                    throw error;
                }
                const [clusterUiConfig, clusterUiDevConfig] = prepareClusterUiConfig(
                    uiConfig,
                    uiDevConfig,
                );
                dispatch({
                    type: INIT_CLUSTER_PARAMS.SUCCESS,
                    data: {
                        cluster,
                        mediumList: ypath.getValue(mediumList.output),
                        clusterUiConfig,
                        clusterUiDevConfig,
                        schedulerVersion: schedulerVersion.output,
                        masterVersion: masterVersion.output,
                    },
                });
            })
            .catch((e) => {
                dispatch({
                    type: INIT_CLUSTER_PARAMS.FAILURE,
                    data: e,
                });
            });
    };
}

function initIsDeveloper(params: {
    cluster: string;
    login: string;
}): GlobalThunkAction<Promise<void>> {
    return async (dispatch) => {
        dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper: false}});

        const rumId = new RumWrapper(params.cluster, RumMeasureTypes.CLUSTER_PARAMS);

        const isDeveloper = await rumId
            .fetch(
                YTApiId.clusterParamsIsDeveloper,
                checkIsDeveloper(params.login, undefined, YTApiId.clusterParamsIsDeveloper),
            )
            .catch((e) => {
                // eslint-disable-next-line no-console
                console.error('Failed to check if current user is admin', e);
                return false;
            });

        dispatch({type: GLOBAL_PARTIAL, data: {isDeveloper}});
    };
}

function initClusterAndUserSettingsAfterClusterChanging(params: {
    cluster: string;
    login: string;
}): GlobalThunkAction<Promise<void>> {
    return async (dispatch, getState) => {
        const {cluster, login} = params;

        initYTApiClusterParams(cluster);

        dispatch(initIsDeveloper({cluster, login}));

        await dispatch(initClusterParams(cluster));
        await dispatch(updateTitle({cluster, path: '', page: ''}));
        await dispatch(reloadUserSettings(login));

        const state = getState();

        if (isRecentClustersFirst(state)) {
            dispatch(splitMenuItemsAction('cluster'));
        } else {
            dispatch(joinMenuItemsAction('clusters'));
        }

        if (isRecentPagesFirst(state)) {
            dispatch(splitMenuItemsAction('page'));
        } else {
            dispatch(joinMenuItemsAction('pages'));
        }

        dispatch(trackVisit('cluster', cluster));
    };
}
interface ClusterInfoData {
    version?: RawVersion;
    versionError?: YTError;
    token?: {
        login: string;
        csrf_token?: string;
    };
    tokenError?: YTError;
}

let count = 0;
export function updateCluster(cluster: string): GlobalThunkAction {
    return (dispatch, getState) => {
        const dispatchError = (error: any) => {
            if (error instanceof Error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
            dispatch({
                type: UPDATE_CLUSTER.FAILURE,
                data: {error: error?.response?.data || error},
            });
        };

        dispatch({
            type: UPDATE_CLUSTER.REQUEST,
        });

        const rumId = new RumWrapper(cluster, RumMeasureTypes.CLUSTER_PARAMS);
        return rumId
            .fetch<AxiosResponse<ClusterInfoData>>(
                YTApiId.ui_clusterInfo,
                axios.request({
                    url: '/api/cluster-info/' + cluster,
                    method: 'GET',
                }),
            )
            .then(({data}) => {
                const {token, tokenError, version, versionError} = data;

                if (count++) {
                    dispatch({
                        type: RESET_STORE_BEFORE_CLUSTER_CHANGE,
                        data: {
                            shouldUsePreserveState: shouldUsePreserveState(getState()),
                        },
                    });
                }

                if (!version || versionError) {
                    dispatch({
                        type: UPDATE_CLUSTER.FAILURE,
                        data: {errorType: PRELOAD_ERROR.CONNECTION, error: versionError},
                    });
                } else {
                    dispatch({
                        type: UPDATE_CLUSTER.SUCCESS,
                        data: {version},
                    });

                    YT.parameters.version = version;
                    YT.cluster = cluster;

                    if (!token?.csrf_token || tokenError) {
                        Cookies.remove(getXsrfCookieName(cluster));
                        dispatch({
                            type: UPDATE_CLUSTER.FAILURE,
                            data: {
                                errorType: PRELOAD_ERROR.AUTHENTICATION,
                                error: tokenError || new Error('Failed to get CSRF-token'),
                            },
                        });
                    } else {
                        const {login, csrf_token} = token;
                        YT.parameters.login = login;
                        dispatch({type: GLOBAL_PARTIAL, data: {login}});
                        Cookies.set(getXsrfCookieName(cluster), csrf_token);

                        return dispatch(
                            initClusterAndUserSettingsAfterClusterChanging({cluster, login}),
                        )
                            .then(() =>
                                dispatch({
                                    type: UPDATE_CLUSTER.FINAL_SUCCESS,
                                }),
                            )
                            .catch(dispatchError);
                    }
                }

                return Promise.resolve();
            })
            .catch(dispatchError);
    };
}

export function unmountCluster(): GlobalThunkAction {
    return (dispatch) => {
        YT.parameters.version = '';
        YT.cluster = '';

        dispatch({
            type: GLOBAL_PARTIAL,
            data: {
                cluster: undefined,
            },
        });
    };
}
