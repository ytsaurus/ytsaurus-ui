// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {Action} from 'redux';

import metrics from '../../../common/utils/metrics';
import {navigationTrackVisit} from '../favourites';
import {RumWrapper, YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';

import {isPathAutoCorrectionSettingEnabled} from '../../selectors/settings';
import {getPath, getTransaction} from '../../selectors/navigation';

import {AppThunkDispatch} from '../../../store/thunkDispatch';
import {RootState} from '../../../store/reducers';
import {
    autoCorrectPath,
    cancelRequests,
    getParentPath,
    prepareRequest,
    saveRequestCancellation,
} from '../../../utils/navigation';
import {prepareAttributes} from '../../../utils/index';
import {getBatchError} from '../../../utils/utils';
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
} from '../../../constants/navigation';
import {getCluster, getCurrentUserName} from '../../selectors/global';
import {fetchTableMountConfig} from './content/table/table-mount-config';
import {checkPermissions} from '../../../utils/acl/acl-api';
import {getAnnotation} from './tabs/annotation';
import {loadTabletErrorsCount} from './tabs/tablet-errors';
import {isSupportedEffectiveExpiration} from '../../selectors/thor/support';
import {getTabs} from '../../selectors/navigation/navigation';
import {YPath, YTError} from '../../../../@types/types';

export interface ViewSettings {
    trackVisit?: boolean;
}

interface AccountPermissions {
    isWriteable?: boolean;
    isAccountUsable?: boolean;
    checkPermissionsError?: boolean;
}

export function updateView(settings: ViewSettings = {}) {
    // todo Change any-type to specific-type
    return (dispatch: AppThunkDispatch<Action>, getState: () => RootState) => {
        const state = getState();
        const currentPath = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: UPDATE_VIEW.REQUEST});
        // Update path for use default path and auto correct path
        const path = dispatch(updatePath(currentPath, false));
        cancelRequests();

        dispatch(getAnnotation());
        dispatch(loadTabletErrorsCount({path, saveCancelTokenSource: saveRequestCancellation}));

        const allowEffectiveExpiration = isSupportedEffectiveExpiration(state);

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
                            {command: 'get', parameters: prepareRequest('/@', requestParams)},
                            {
                                command: 'get',
                                parameters: prepareRequest('/@', {
                                    ...requestParams,
                                    attributes: [
                                        'path',
                                        ...(allowEffectiveExpiration
                                            ? ['effective_expiration']
                                            : []),
                                    ],
                                }),
                            },
                        ],
                        output_format: TYPED_OUTPUT_FORMAT,
                    },
                    saveRequestCancellation,
                ),
            )
            .then((results) => {
                const [attrs, {output: opaqueAttrs} = {output: undefined}] = results;
                const pathError = prepareAttributes(path.error) as YTError | undefined;
                if (pathError?.code === yt.codes.NODE_DOES_NOT_EXIST) {
                    delete path.error;
                }

                const error = getBatchError(results, 'Failed to get navigation attributes');
                if (error) {
                    // Convert typed errors to regular ones
                    error.inner_errors = error.inner_errors?.map(
                        (innerError) => prepareAttributes(innerError) as YTError,
                    );
                    throw error;
                }

                return {
                    ...attrs.output,
                    ...(opaqueAttrs?.effective_expiration
                        ? {effective_expiration: opaqueAttrs.effective_expiration}
                        : {}),
                    ...(path.output ? {path: opaqueAttrs.path} : {}),
                };
            })
            .then((attributes) => {
                const preparedAttributes = prepareAttributes(
                    attributes as Record<string, unknown>,
                    {
                        asHTML: false,
                    },
                );

                if (settings.trackVisit) {
                    dispatch(navigationTrackVisit(path));
                }

                metrics.countEvent({
                    navigation_path: {
                        // @ts-ignore
                        type: preparedAttributes.type,
                    },
                });

                const user = getCurrentUserName(state);
                const {account} = preparedAttributes as {account: string};

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
                }: AccountPermissions) => {
                    dispatch({
                        type: NAVIGATION_PARTIAL,
                        data: {isWriteable, isAccountUsable, checkPermissionsError},
                    });
                };

                dispatch(fetchTableMountConfig(path));

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

interface SetModeDispatchAction extends Action {
    /**
     * @see {@link Tab} is common variants of tab
     */
    data: string;
}

/**
 * @see {@link Tab} is common variants of tab
 */
export function setMode(mode: string) {
    return (dispatch: AppThunkDispatch<SetModeDispatchAction>, getState: () => RootState) => {
        const [firstTab] = getTabs(getState());

        dispatch({
            type: SET_MODE,
            data: mode === firstTab?.value ? Tab.AUTO : mode,
        });
    };
}

export function onTransactionChange() {
    return (dispatch: (action: ReturnType<typeof updateView>) => unknown) => {
        dispatch(updateView({trackVisit: true}));
        // Need to update breadcrumbs dimensions after transaction change
        window.dispatchEvent(new Event('resize'));
    };
}

interface SetTransactionDispatchAction extends Action {
    data: string;
}

type ClearTransactionDispatch = AppThunkDispatch<Action>;

type TransactionDispatch = AppThunkDispatch<SetTransactionDispatchAction> &
    ClearTransactionDispatch &
    ((action: ReturnType<typeof onTransactionChange>) => unknown);

// todo Check is type of transaction correct
export function setTransaction(transaction: string) {
    return (dispatch: TransactionDispatch) => {
        dispatch({
            type: SET_TRANSACTION,
            data: transaction,
        });
        dispatch(onTransactionChange());
    };
}

export function clearTransaction() {
    return (dispatch: TransactionDispatch) => {
        dispatch({
            type: CLEAR_TRANSACTION,
        });
        dispatch(onTransactionChange());
    };
}

interface UpdatePathDispatchAction extends Action {
    data: {
        path: string;
        shouldUpdateContentMode: boolean;
    };
}

export function updatePath(path: string, shouldUpdateContentMode = true) {
    return (
        dispatch: AppThunkDispatch<UpdatePathDispatchAction>,
        getState: () => RootState,
    ): string | YPath => {
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

export function navigateParent() {
    return (
        dispatch: (data: ReturnType<typeof updatePath>) => string,
        getState: () => RootState,
    ) => {
        const {path} = getState().navigation.navigation;
        const nextPath = getParentPath(path);
        dispatch(updatePath(nextPath));
    };
}
