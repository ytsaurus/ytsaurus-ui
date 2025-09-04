import {ThunkAction} from 'redux-thunk';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getBatchError} from '../../../../shared/utils/error';

import {getMetrics} from '../../../common/utils/metrics';
import {navigationTrackVisit} from '../../../store/actions/favourites';
import {RumWrapper, YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';

import {isPathAutoCorrectionSettingEnabled} from '../../../store/selectors/settings';
import {getPath, getTransaction} from '../../../store/selectors/navigation';

import {
    autoCorrectPath,
    cancelRequests,
    getParentPath,
    prepareRequest,
    saveRequestCancellation,
} from '../../../utils/navigation';
import {prepareAttributes} from '../../../utils/index';
import {getPermissionDeniedError} from '../../../utils/errors';

import {GENERIC_ERROR_MESSAGE, TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {
    CLEAR_TRANSACTION,
    NAVIGATION_PARTIAL,
    SET_MODE,
    SET_TRANSACTION,
    Tab,
    UPDATE_PATH,
    UPDATE_VIEW,
} from '../../../constants/navigation/index';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';
import {fetchTableMountConfig} from '../../../store/actions/navigation/content/table/table-mount-config';
import {checkPermissions} from '../../../utils/acl/acl-api';
import {loadTabletErrorsCount} from './tabs/tablet-errors/tablet-errors-background';
import {getTabs} from '../../../store/selectors/navigation/navigation';
import UIFactory from '../../../UIFactory';
import {RootState} from '../../../store/reducers';
import {NavigationAction, NavigationState} from '../../../store/reducers/navigation/navigation';
import {fetchOriginatingQueuePath} from './tabs/queue/exports';

type NavigationThunk<T = void> = ThunkAction<T, RootState, unknown, NavigationAction>;

export function updateView(settings: {trackVisit?: boolean} = {}): NavigationThunk {
    return (dispatch, getState) => {
        const state = getState();
        const currentPath = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: UPDATE_VIEW.REQUEST});
        // Update path for use default path and auto correct path
        const path = dispatch(updatePath(currentPath, false));
        cancelRequests();

        dispatch(loadTabletErrorsCount({path, saveCancelTokenSource: saveRequestCancellation}));

        const requestParams = {
            path,
            transaction,
        };

        const cluster = getCluster(state);

        const id = new RumWrapper(cluster, RumMeasureTypes.NAVIGATION_PRELOAD);

        return id
            .fetch(
                YTApiId.navigationAttributes,
                ytApiV3Id.executeBatch(
                    YTApiId.navigationAttributes,
                    {
                        requests: [
                            {
                                command: 'get' as const,
                                parameters: {
                                    ...prepareRequest('/@', requestParams),
                                    attributes: getAttributesToLoad(),
                                },
                            },
                        ],
                        output_format: TYPED_OUTPUT_FORMAT,
                    },
                    saveRequestCancellation,
                ),
            )
            .then((results) => {
                const [attrs] = results;

                const error = getBatchError(results, 'Failed to get navigation attributes');
                if (error) {
                    throw error;
                }

                return attrs.output;
            })
            .then((attributes) => {
                const preparedAttributes = prepareAttributes(attributes, {
                    asHTML: false,
                }) as {account: string; type: string};

                if (settings.trackVisit) {
                    dispatch(navigationTrackVisit(path));
                }

                getMetrics().countEvent('navigation_path', {type: preparedAttributes.type});

                const user = getCurrentUserName(state);
                const {account} = preparedAttributes;

                dispatch({
                    type: UPDATE_VIEW.SUCCESS,
                    data: {
                        attributesWithTypes: attributes,
                        attributes: preparedAttributes,
                    },
                });

                const dispatchAccountPermissions = ({
                    isWriteable,
                    isAccountUsable,
                    checkPermissionsError,
                }: Pick<
                    Partial<NavigationState>,
                    'isWriteable' | 'isAccountUsable' | 'checkPermissionsError'
                >) => {
                    dispatch({
                        type: NAVIGATION_PARTIAL,
                        data: {isWriteable, isAccountUsable, checkPermissionsError},
                    });
                };

                dispatch(fetchTableMountConfig(path));
                dispatch(fetchOriginatingQueuePath());

                if (!account) {
                    /**
                     * If account is not defined we just pretend that everything is awesome
                     * and the code works the same as there are no any checks of permissions.
                     */
                    return dispatchAccountPermissions({
                        isWriteable: true,
                        isAccountUsable: true,
                    });
                }

                checkPermissions(
                    [
                        {
                            user,
                            permission: 'write',
                            path,
                            transaction_id: transaction,
                        },
                        {
                            user,
                            permission: 'use',
                            path: `//sys/accounts/${account}`,
                            transaction_id: transaction,
                        },
                    ],
                    YTApiId.navigationCheckPermissions,
                )
                    .then(([{action: writeAction}, {action: useAction}]) => {
                        dispatchAccountPermissions({
                            isWriteable: writeAction === 'allow',
                            isAccountUsable: useAction === 'allow',
                        });
                    })
                    .catch((checkPermissionsError) => {
                        dispatchAccountPermissions({checkPermissionsError});
                    });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({
                        type: UPDATE_VIEW.CANCELLED,
                    });
                } else {
                    const permissionDeniedError = getPermissionDeniedError(error);
                    const message = ['Error occurred when loading path.'];
                    if (!permissionDeniedError) message.push(GENERIC_ERROR_MESSAGE);

                    ytApiV3
                        .exists({path: '//sys/idm/lock'})
                        .catch(() => false)
                        .then((isIdmSupported) => {
                            dispatch({
                                type: UPDATE_VIEW.FAILURE,
                                data: {
                                    message: message.join(' '),
                                    details: error,
                                    isIdmSupported,
                                },
                            });
                        });
                }
            });
    };
}

export function setMode(mode: NavigationState['mode']): NavigationThunk {
    return (dispatch, getState) => {
        const [firstTab] = getTabs(getState());

        dispatch({
            type: SET_MODE,
            data: mode === firstTab?.value ? Tab.AUTO : mode,
        });
    };
}

export function onTransactionChange(): NavigationThunk {
    return (dispatch) => {
        dispatch(updateView({trackVisit: true}));
        // Need to update breadcrumbs dimensions after transaction change
        window.dispatchEvent(new Event('resize'));
    };
}

export function setTransaction(transaction?: string): NavigationThunk {
    return (dispatch) => {
        dispatch({
            type: SET_TRANSACTION,
            data: transaction,
        });
        dispatch(onTransactionChange());
    };
}

export function clearTransaction(): NavigationThunk {
    return (dispatch) => {
        dispatch({
            type: CLEAR_TRANSACTION,
        });
        dispatch(onTransactionChange());
    };
}

export function updatePath(path: string, shouldUpdateContentMode = true): NavigationThunk<string> {
    return (dispatch, getState) => {
        const autoCorrectionEnabled = isPathAutoCorrectionSettingEnabled(getState());

        const correctedPath = autoCorrectionEnabled ? autoCorrectPath(path) : path;

        dispatch({
            type: UPDATE_PATH,
            data: {
                path: correctedPath,
                shouldUpdateContentMode,
            },
        });

        return correctedPath;
    };
}

export function navigateParent(): NavigationThunk {
    return (dispatch, getState) => {
        const {path} = getState().navigation.navigation;
        const nextPath = getParentPath(path);
        dispatch(updatePath(nextPath));
    };
}

const attributesToLoad = [
    '_format',
    '_read_schema',
    '_restore_path',
    '_yql_key_meta',
    '_yql_op_id',
    '_yql_runner',
    '_yql_row_spec',
    '_yql_subkey_meta',
    '_yql_type',
    '_yql_value_meta',
    'access_time',
    'account',
    'acl',
    'atomicity',
    'broken',
    'chunk_count',
    'chunk_row_count',
    'cluster_name',
    'compressed_data_size',
    'compression_codec',
    'compression_ratio',
    'creation_time',
    'data_weight',
    'default_disk_space',
    'disk_space',
    'dynamic',
    'effective_expiration',
    'enable_dynamic_store_read',
    'erasure_codec',
    'expiration_time',
    'expiration_timeout',
    'id',
    'in_memory_mode',
    'key',
    'key_columns',
    'leader_controller_address',
    'lock_count',
    'lock_mode',
    'locks',
    'mode',
    'modification_time',
    'monitoring_cluster',
    'monitoring_project',
    'optimize_for',
    'owner',
    'path',
    'pipeline_format_version',
    'primary_medium',
    'queue_static_export_destination',
    'remount_needed_tablet_count',
    'replica_path',
    'replicated_table_options',
    'replication_factor',
    'resource_usage',
    'schema',
    'schema_mode',
    'security_tags',
    'sorted',
    'sorted_by',
    'start_time',
    'state',
    'tablet_cell_bundle',
    'tablet_count',
    'tablet_error_count',
    'tablet_state',
    'target_path',
    'timeout',
    'title',
    'treat_as_queue_consumer',
    'type',
    'uncompressed_data_size',
];

function getAttributesToLoad() {
    const additionalAttributes: Array<string> = [];

    UIFactory.getNavigationExtraTabs().forEach((extraTab) => {
        additionalAttributes.push(...extraTab.additionalAttributes);
    });

    const attributesSet = new Set([...attributesToLoad, ...additionalAttributes]);

    return [...attributesSet];
}

export function setNavigationSidePanelMode(
    sidePanelMode: NavigationState['sidePanelMode'],
): NavigationAction {
    return {type: NAVIGATION_PARTIAL, data: {sidePanelMode}};
}
