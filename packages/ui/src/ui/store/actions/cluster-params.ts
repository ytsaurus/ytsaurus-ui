import axios, {AxiosResponse} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import Cookies from 'js-cookie';

import ypath from '../../common/thor/ypath';
import {prepareCheckIsDeveloperRequests} from '../../../shared/utils/check-is-developer';
import {INIT_CLUSTER_PARAMS, LOAD_ERROR, UPDATE_CLUSTER} from '../../constants/index';
import {getCurrentUserName} from '../../store/selectors/global';
import {getXsrfCookieName} from '../../utils';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../constants/utils';
import {shouldUsePreserveState} from '../../store/selectors/settings';
import {rumLogError} from '../../rum/rum-counter';
import {Toaster} from '@gravity-ui/uikit';
import {RumWrapper, YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../rum/rum-measure-types';
import {getBatchError, wrapApiPromiseByToaster} from '../../utils/utils';
import {BatchResultsItem} from '../../../shared/yt-types';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../store/reducers';
import YT from '../../config/yt-config';
import {GLOBAL_PARTIAL} from '../../constants/global';
import {FIX_MY_TYPE, YTError} from '../../../@types/types';
import {initYTApiClusterParams} from '../../common/yt-api-init';

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

const toast = new Toaster();

function prepareClusterUiConfig(uiConfig: BatchResultsItem, uiDevConfig: BatchResultsItem) {
    if (uiConfig.error && uiConfig.error.code !== yt.codes.NODE_DOES_NOT_EXIST) {
        handleUiConfigError('//sys/@ui_config', uiConfig.error);
        toast.createToast({
            name: 'get-ui_config',
            type: 'error',
            allowAutoHiding: false,
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

export function initClusterParams(cluster: string): GlobalThunkAction<Promise<void>> {
    return (dispatch, getState) => {
        initYTApiClusterParams(cluster);

        dispatch({
            type: INIT_CLUSTER_PARAMS.REQUEST,
        });

        const login = getCurrentUserName(getState());

        const rumId = new RumWrapper(cluster, RumMeasureTypes.CLUSTER_PARAMS);
        return wrapApiPromiseByToaster(
            Promise.all([
                rumId.fetch(
                    YTApiId.clusterParamsIsDeveloper,
                    ytApiV3Id.executeBatch(YTApiId.clusterParamsIsDeveloper, {
                        requests: prepareCheckIsDeveloperRequests(login),
                    }),
                ),
                rumId.fetch(
                    YTApiId.clusterParams,
                    axios.request({
                        url: '/api/cluster-params/' + cluster,
                        method: 'GET',
                    }),
                ),
            ]),
            {
                skipSuccessToast: true,
                toasterName: 'cluster_initialization_failure',
                errorTitle: 'Cluster initialization failure',
                errorContent: 'An error occured',
            },
        )
            .then(([[checkDeveloper], {data}]) => {
                const isDeveloper = checkDeveloper?.output?.action === 'allow';
                const {mediumList, schedulerVersion, masterVersion, uiConfig, uiDevConfig} = data;
                const error = getBatchError(
                    [mediumList, isDeveloper],
                    'Cluster initialization failure',
                );
                if (error) {
                    throw error;
                }
                const [uiConfigOutput, uiDevConfigOutput] = prepareClusterUiConfig(
                    uiConfig,
                    uiDevConfig,
                );
                dispatch({
                    type: INIT_CLUSTER_PARAMS.SUCCESS,
                    data: {
                        cluster,
                        mediumList: ypath.getValue(mediumList.output),
                        isDeveloper,
                        clusterUiConfig: isDeveloper
                            ? Object.assign({}, uiConfigOutput, uiDevConfigOutput)
                            : uiConfigOutput,
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

interface ClusterInfoData {
    version?: string;
    versionError?: YTError;
    token?: {
        login: string;
        csrf_token?: string;
    };
    tokenError?: YTError;
}

let count = 0;
export function updateCluster(
    cluster: string,
    onUpdateEnd: () => Promise<void>,
): GlobalThunkAction {
    return (dispatch, getState) => {
        const dispatchError = (error: any) => {
            if (error instanceof Error) {
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
                        data: {errorType: LOAD_ERROR.CONNECTION, error: versionError},
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
                                errorType: LOAD_ERROR.AUTHENTICATION,
                                error: tokenError || new Error('Failed to get CSRF-token'),
                            },
                        });
                    } else {
                        const {login, csrf_token} = token;
                        YT.parameters.login = login;
                        dispatch({type: GLOBAL_PARTIAL, data: {login}});
                        Cookies.set(getXsrfCookieName(cluster), csrf_token);
                        return onUpdateEnd()
                            .then(() => {
                                dispatch({
                                    type: UPDATE_CLUSTER.FINAL_SUCCESS,
                                });
                            })
                            .catch(dispatchError);
                    }
                }

                return Promise.resolve();
            })
            .catch(dispatchError);
    };
}
