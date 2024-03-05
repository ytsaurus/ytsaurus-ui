import type {ThunkAction} from 'redux-thunk';
import type {RootState} from '../../reducers';
import type {ManageTokensListAction} from '../../reducers/manage-tokens/tokens';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {getQueryTrackerCluster} from '../../../config';
import {getClusterConfigByName, getClusterProxy} from '../../selectors/global';
import {
    MANAGE_TOKENS_LIST,
    MANAGE_TOKENS_MODALS_CLOSE,
    MANAGE_TOKENS_MODALS_OPEN,
} from '../../../constants/manage-tokens';
import {ManageTokensModalAction} from '../../reducers/manage-tokens/modal';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

function getQTApiSetup(): {proxy?: string} {
    const QT_CLUSTER = getQueryTrackerCluster();
    if (QT_CLUSTER) {
        const cluster = getClusterConfigByName(QT_CLUSTER);
        if (cluster) {
            return {
                proxy: getClusterProxy(cluster),
            };
        }
    }
    return {};
}

type Credentials = {
    user: string;
    password_sha256: string;
};
export const manageTokensGetList = (
    credentials: Credentials,
): ThunkAction<Promise<unknown>, RootState, unknown, ManageTokensListAction> => {
    return (dispatch) => {
        dispatch({type: MANAGE_TOKENS_LIST.REQUEST});

        return ytApiV4Id
            .listUserTokens(YTApiId.listUserTokens, {
                parameters: {
                    ...credentials,
                    with_metadata: true,
                },
                setup: getQTApiSetup(),
            })
            .then((data) => {
                dispatch({type: MANAGE_TOKENS_LIST.SUCCESS, data: {data}});
            })
            .catch((error) => {
                dispatch({type: MANAGE_TOKENS_LIST.FAILURE, data: {error}});

                throw error;
            });
    };
};

export const manageTokensCreateToken = ({
    description,
    credentials,
}: {
    description: string;
    credentials: Credentials;
}): ThunkAction<Promise<string>, RootState, unknown, ManageTokensListAction> => {
    return () => {
        return ytApiV4Id.issueToken(YTApiId.issueToken, {
            parameters: {
                description,
                ...credentials,
            },
            setup: getQTApiSetup(),
        });
    };
};

export const manageTokensRevokeToken = ({
    credentials,
    token_sha256,
}: {
    token_sha256: string;
    credentials: Credentials;
}): ThunkAction<Promise<unknown>, RootState, unknown, ManageTokensListAction> => {
    return () => {
        return wrapApiPromiseByToaster(
            ytApiV4Id.revokeToken(YTApiId.issueToken, {
                parameters: {
                    token_sha256,
                    ...credentials,
                },
                setup: getQTApiSetup(),
            }),
            {
                autoHide: true,
                toasterName: token_sha256,
                successContent: 'The token has been removed',
            },
        );
    };
};

export const openManageTokensModal = (): ThunkAction<
    unknown,
    RootState,
    unknown,
    ManageTokensModalAction
> => {
    return (dispatch) => {
        dispatch({type: MANAGE_TOKENS_MODALS_OPEN});
    };
};

export const closeManageTokensModal = (): ThunkAction<
    unknown,
    RootState,
    unknown,
    ManageTokensModalAction
> => {
    return (dispatch) => {
        dispatch({type: MANAGE_TOKENS_MODALS_CLOSE});
    };
};
