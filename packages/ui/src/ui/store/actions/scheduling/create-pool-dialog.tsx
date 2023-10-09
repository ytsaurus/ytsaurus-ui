import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {
    CreatePoolDialogAction,
    CreatePoolDialogState,
} from '../../reducers/scheduling/create-pool-dialog';
import {
    CREATE_POOL_DIALOG_TREE_CREATE_FAILURE,
    CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS,
} from '../../../constants/scheduling';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {prepareAbcService} from '../../../utils/scheduling';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {loadSchedulingData} from './scheduling-ts';
import {FIX_MY_TYPE} from '../../../types';
import {getCluster} from '../../selectors/global';
import {updateAcl} from '../../../utils/acl/acl-api';
import {IdmObjectType} from '../../../constants/acl';
import Link from '../../../components/Link/Link';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {createAdminReqTicketUrl} from '../../../config';

type CreatePoolDialogThunkAction<R = any> = ThunkAction<
    R,
    RootState,
    unknown,
    CreatePoolDialogAction
>;

export function fetchCreatePoolDialogTreeItems(currentTree: string): CreatePoolDialogThunkAction {
    return (dispatch) => {
        return ytApiV3Id
            .get(YTApiId.getPoolTrees, {path: `//sys/pool_trees/${currentTree}`})
            .then((treeItems: CreatePoolDialogState['treeItems']) => {
                dispatch({
                    type: CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS,
                    data: {currentTree, treeItems},
                });
            });
    };
}

export function createPool(values: FIX_MY_TYPE): CreatePoolDialogThunkAction {
    return (dispatch, getState) => {
        const {abcService} = values;
        const cluster = getCluster(getState()) as string;

        return wrapApiPromiseByToaster(
            yt.v3.create({
                type: 'scheduler_pool',
                attributes: Object.assign(
                    {
                        name: values.name,
                        parent_name: values.parent,
                        pool_tree: values.tree,
                    },
                    !abcService || !abcService.value
                        ? {}
                        : {
                              abc: prepareAbcService(abcService),
                          },
                ),
            }),
            {
                toasterName: `create_${values.name}`,
                successContent: `Successfully created ${values.name}. Please wait.`,
                errorContent: `'${values.name}' pool creation failed`,
                timeout: 10000,
            },
        )
            .then(() => {
                updateAcl(cluster, values.name, {
                    idmKind: IdmObjectType.POOL,
                    poolTree: values.tree,
                    responsible: values.responsible,
                });

                return waitWhilePoolIsReady(values).then(() => {
                    dispatch(loadSchedulingData());
                });
            })
            .catch((error) => {
                if (error?.code === yt.codes.CANCELLED) {
                    return;
                }

                dispatch({
                    type: CREATE_POOL_DIALOG_TREE_CREATE_FAILURE,
                    data: error,
                });

                return Promise.reject(error);
            });
    };
}

const {url: createUrl, queue} = createAdminReqTicketUrl();

const CHECK_REDINESS_TIMEOUT = 1500;
const MAX_POOL_REDINESS_TIMEOUT = 10 * 1000; // the value is provided by @renadeen
const TIMEOUT_ERROR = {
    message: (
        <div>
            The pool was not appeared in orchidea in 10 seconds.
            {createUrl ? (
                <>
                    Please fill a ticket for <Link url={createUrl}>{queue}</Link>
                </>
            ) : (
                "Please report it to the cluster's support team."
            )}
            .
        </div>
    ),
};

function waitWhilePoolIsReady({name, tree}: {name: string; tree: string}, startedAt = 0) {
    const startedTime = startedAt || Date.now();
    const diff = Date.now() - startedTime;
    if (diff > MAX_POOL_REDINESS_TIMEOUT) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            yt.v3
                .exists({
                    path: `//sys/scheduler/orchid/scheduler/scheduling_info_per_pool_tree/${tree}/fair_share_info/pools/${name}`,
                })
                .then((res: boolean) => {
                    if (res) {
                        return resolve(true);
                    } else {
                        return resolve(waitWhilePoolIsReady({name, tree}, startedTime));
                    }
                })
                .catch((error: unknown) => {
                    if (error !== TIMEOUT_ERROR) {
                        return resolve(waitWhilePoolIsReady({name, tree}, startedTime));
                    }

                    return reject(error);
                });
        }, CHECK_REDINESS_TIMEOUT);
    });
}
