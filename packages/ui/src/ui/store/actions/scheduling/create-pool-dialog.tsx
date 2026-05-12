import React from 'react';
import {type ThunkAction} from 'redux-thunk';
import {
    CREATE_POOL_DIALOG_TREE_CREATE_FAILURE,
    CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS,
} from '../../../constants/scheduling';
import {
    CreatePoolDialogAction,
    CreatePoolDialogState,
} from '../../reducers/scheduling/create-pool-dialog';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import Link from '../../../components/Link/Link';
import {createAdminReqTicketUrl} from '../../../config';
import {IdmObjectType} from '../../../constants/acl';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {updateAcl} from '../../../store/actions/acl';
import UIFactory from '../../../UIFactory';
import {type ResponsibleType} from '../../../utils/acl/acl-types';
import {prepareAbcService} from '../../../utils/scheduling';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {type RootState} from '../../reducers';
import {loadSchedulingData} from './scheduling-ts';

type CreatePoolDialogThunkAction<R = void> = ThunkAction<
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

export function createPool({
    name,
    parent,
    tree,
    responsible,
    abcService,
}: {
    name: string;
    parent?: string;
    tree: string;
    responsible: Array<ResponsibleType>;
    abcService: {value: string; title: string; id: number};
}): CreatePoolDialogThunkAction {
    return (dispatch) => {
        return wrapApiPromiseByToaster(
            yt.v3.create({
                type: 'scheduler_pool',
                attributes: Object.assign(
                    {
                        name,
                        parent_name: parent || undefined,
                        pool_tree: tree,
                    },
                    !abcService || !abcService.value
                        ? {}
                        : {
                              abc: prepareAbcService(abcService),
                          },
                ),
            }),
            {
                toasterName: `create_${name}`,
                successContent: `Successfully created ${name}. Please wait.`,
                errorContent: `'${name}' pool creation failed`,
                timeout: 10000,
            },
        )
            .then(() => {
                return waitWhilePoolIsReady({name, tree}).then(() => {
                    if (UIFactory.getAclApi().isAllowed) {
                        dispatch(
                            updateAcl({
                                values: {responsible},
                                path: name,
                                idmKind: IdmObjectType.POOL,
                            }),
                        );
                    }

                    dispatch(loadSchedulingData());
                });
            })
            .catch((error) => {
                if (error?.code === yt.codes.CANCELLED) {
                    return undefined;
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
                    path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${name}`,
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
