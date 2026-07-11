import React from 'react';
import {type ThunkAction} from 'redux-thunk';
import {
    CREATE_POOL_DIALOG_TREE_CREATE_FAILURE,
    CREATE_POOL_DIALOG_TREE_ITEMS_SUCCESS,
} from '../../../constants/scheduling';
import {type RootState} from '../../reducers';
import {
    type CreatePoolDialogAction,
    type CreatePoolDialogState,
} from '../../reducers/scheduling/create-pool-dialog';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import Link from '../../../containers/Link/Link';
import {createAdminReqTicketUrl} from '../../../config';
import {IdmObjectType} from '../../../constants/acl';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {updateAcl} from '../../../store/actions/acl';
import UIFactory from '../../../UIFactory';
import {type ResponsibleType} from '../../../utils/acl/acl-types';
import {prepareAbcService} from '../../../utils/scheduling';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import i18n from './i18n';
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
                successContent: i18n('alert_create-pool-success', {name}),
                errorContent: i18n('alert_create-pool-failure', {name}),
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
    get message() {
        return (
            <div>
                {i18n('alert_pool-not-appeared')}
                {createUrl ? (
                    <>
                        {i18n('alert_pool-fill-ticket')} <Link url={createUrl}>{queue}</Link>
                    </>
                ) : (
                    i18n('alert_pool-contact-support')
                )}
                .
            </div>
        );
    },
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
