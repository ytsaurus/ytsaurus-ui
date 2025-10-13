// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import React from 'react';
import moment from 'moment';
// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import Link from '../../../../components/Link/Link';

import {checkIsTrash, getRawPath} from '../../../../store/selectors/navigation';
import {showErrorPopup, wrapBatchPromise} from '../../../../utils/utils';
import {navigateParent, updateView} from '../../../../store/actions/navigation';
import {decodeEscapedAbsPath, preparePath} from '../../../../utils/navigation';
import {
    CLOSE_DELETE_OBJECT_POPUP,
    DELETE_OBJECT,
    LOAD_REAL_PATH,
    OPEN_DELETE_OBJECT_POPUP,
    SUPPRESS_REDIRECT,
    TOGGLE_PERMANENTLY_DELETE,
} from '../../../../constants/navigation/modals/delete-object';

import find_ from 'lodash/find';
import map_ from 'lodash/map';

import {executeBatchWithRetries} from '../../execute-batch';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import type {RootState} from '../../../../store/reducers';
import type {Dispatch} from 'redux';
import type {
    DeleteObjectItem,
    MulipleInfoItem,
} from '../../../../store/reducers/navigation/modals/delete-object';
import {BatchSubRequest} from '../../../../../shared/yt-types';
import type {YTError} from '../../../../types';
import type {AppDispatch} from '../../../store.main';
import {toaster} from '../../../../utils/toaster';

function prepareRestorePath(path: string, type: string) {
    const lastChar = path.charAt(path.length - 1);

    if (type === 'link' && lastChar === SUPPRESS_REDIRECT) {
        return path.slice(0, path.length - 1);
    }

    return path;
}

export function openDeleteModal(
    item: DeleteObjectItem | Array<DeleteObjectItem>,
    multipleMode = false,
) {
    return (dispatch: Dispatch, getState: () => RootState) => {
        const inTrash = checkIsTrash(getState());

        dispatch({
            type: OPEN_DELETE_OBJECT_POPUP,
            data: {item, inTrash, multipleMode},
        });
    };
}

export function closeDeleteModal() {
    return {
        type: CLOSE_DELETE_OBJECT_POPUP,
    };
}

export function togglePermanentlyDelete() {
    return {
        type: TOGGLE_PERMANENTLY_DELETE,
    };
}

const getPath = (path: string, type: string) => {
    return ['link', 'access_control_object'].includes(type)
        ? Promise.resolve(path)
        : ytApiV3Id.get(YTApiId.navigationGetPath, {
              path: path + '/@path',
              output_format: {
                  $value: 'json',
                  $attributes: {
                      encode_utf8: 'false',
                  },
              },
          });
};

const getInfo = (realPath: string) => {
    const parsedRealPath = ypath.YPath.create(realPath, 'absolute');
    const path = parsedRealPath.stringify();
    const name = parsedRealPath.getKey();

    return Promise.all([
        path,
        name,
        ytApiV3Id.get(YTApiId.navigationGetPathInfo, {
            path: path + '&/@',
            attributes: ['recursive_resource_usage', 'account'],
        }),
    ]);
};

export function getRealPath({path, type}: {path: string; type: string}) {
    return (dispatch: Dispatch) => {
        dispatch({type: LOAD_REAL_PATH.REQUEST});

        return getPath(path, type)
            .then(getInfo)
            .then(([realPath, name, info]) => {
                const account = ypath.get(info, '/account');
                const resourceUsage = ypath.get(info, '/recursive_resource_usage');

                dispatch({
                    type: LOAD_REAL_PATH.SUCCESS,
                    data: {realPath, name, account, resourceUsage},
                });
            })
            .catch((error) => {
                console.error(error);
                toaster.add({
                    theme: 'danger',
                    name: 'real path',
                    autoHiding: 10000,
                    title: 'Could not open delete dialog.',
                    content: error.message,
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
                dispatch({
                    type: LOAD_REAL_PATH.FAILURE,
                    data: {error},
                });
            });
    };
}

export function getRealPaths(items: {path: string}[]) {
    return (dispatch: Dispatch) => {
        dispatch({type: LOAD_REAL_PATH.REQUEST});

        const requests: BatchSubRequest[] = map_(items, ({path}) => {
            return {
                command: 'get',
                parameters: {
                    path: `${path}&/@`,
                    attributes: ['recursive_resource_usage', 'account', 'path', 'type'],
                    output_format: {
                        $value: 'json',
                        $attributes: {
                            encode_utf8: 'false',
                        },
                    },
                },
            };
        });

        return executeBatchWithRetries(YTApiId.navigationDelete, requests, {
            errorTitle: 'Failed to get real paths',
        })
            .then((responses) => {
                const error = find_(responses, (res) => res.error) as {error: YTError} | undefined;
                if (error) {
                    return Promise.reject(error.error);
                }
                const multipleInfo = map_(responses, (res, index) => {
                    const type = ypath.get(res.output, '/type');

                    if (type === 'access_control_object') {
                        return {type, path: items[index].path};
                    }

                    const path = ypath.get(res.output, '/path');
                    const account = ypath.get(res.output, '/account');
                    const resourceUsage = ypath.get(res.output, '/recursive_resource_usage');
                    const name = path.split('/').reverse()[0];

                    return {path, account, type, name, resourceUsage};
                });

                return dispatch({
                    type: LOAD_REAL_PATH.SUCCESS,
                    data: {multipleInfo},
                });
            })
            .catch((error) => {
                console.error(error);
                toaster.add({
                    theme: 'danger',
                    name: 'real path',
                    autoHiding: 10000,
                    title: 'Could not open delete dialog.',
                    content: error.message,
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
                return dispatch({
                    type: LOAD_REAL_PATH.FAILURE,
                    data: {error},
                });
            });
    };
}

const createDestinationPath = (account: string, name: string, login: string) =>
    `//tmp/trash/by-account/${account}/${login}/${name}_${moment().unix()}`;

function deleteCurrentObject(path: string, restorePath: string) {
    return (_dispatch: Dispatch, getState: () => RootState): Promise<void> => {
        const {global, navigation} = getState();
        const {permanently, name, account} = navigation.modals.deleteObject;
        const {login} = global;

        if (permanently) {
            return yt.v3.remove({path}).then(() => {
                toaster.add({
                    theme: 'success',
                    name: 'delete object',
                    autoHiding: 10000,
                    title: 'Object has been permanently deleted.',
                });
            });
        } else {
            const destinationPath = createDestinationPath(account, name, login);

            return yt.v3
                .set(
                    {
                        path: preparePath(path) + '/@_restore_path',
                        input_format: {
                            $value: 'json',
                            $attributes: {
                                encode_utf8: 'false',
                            },
                        },
                    },
                    restorePath,
                )
                .then(() =>
                    yt.v3.move({
                        recursive: true,
                        source_path: path,
                        preserve_account: true,
                        destination_path: destinationPath,
                    }),
                )
                .then(() => {
                    toaster.add({
                        theme: 'success',
                        name: 'delete object',
                        autoHiding: 10000,
                        title: 'Object moved',
                        content: (
                            <div>
                                Object has been moved to{' '}
                                <Link url={`navigation?path=${destinationPath}`}>trash</Link>
                            </div>
                        ),
                    });
                });
        }
    };
}

export function deleteObject() {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const {navigation} = getState();
        const {realPath, item} = navigation.modals.deleteObject;
        const {transaction} = navigation.navigation;

        const path = preparePath(realPath);
        const restorePath = prepareRestorePath(realPath, (item as DeleteObjectItem).type);

        dispatch({type: DELETE_OBJECT.REQUEST});

        if (transaction) {
            dispatch({type: CLOSE_DELETE_OBJECT_POPUP});

            toaster.add({
                theme: 'danger',
                name: 'delete object',
                autoHiding: 10000,
                title: 'Could not delete the object within transaction.',
            });
        }

        dispatch(deleteCurrentObject(path, restorePath))
            .then(() => {
                dispatch({type: DELETE_OBJECT.SUCCESS});
                dispatch({type: CLOSE_DELETE_OBJECT_POPUP});

                const currentPath = getRawPath(getState());
                const realPathDecoded = decodeEscapedAbsPath(realPath);

                if (currentPath === realPathDecoded) {
                    dispatch(navigateParent());
                } else {
                    dispatch(updateView());
                }
            })
            .catch((error) => {
                console.error(error);
                dispatch({
                    type: DELETE_OBJECT.FAILURE,
                    data: {error},
                });
                toaster.add({
                    theme: 'danger',
                    name: 'delete object',
                    autoHiding: 10000,
                    title: 'Could not delete the node.',
                    content: error.message,
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
            });
    };
}

function permanentlyDeleteObjects(multipleInfo: MulipleInfoItem[], transaction: string) {
    const requests: BatchSubRequest[] = map_(multipleInfo, (node) => {
        const path = preparePath(node.path);

        return {
            command: 'remove',
            parameters: {path: path, transaction_id: transaction},
        };
    });

    return wrapBatchPromise(
        executeBatchWithRetries(YTApiId.navigationDelete, requests, {
            errorTitle: 'Failed to delete object(s) permanently',
        }),
        'Failed to delete object(s) permanently',
    )
        .then(() => yt.v3.commitTransaction({transaction_id: transaction}))
        .then(() => {
            toaster.add({
                theme: 'success',
                name: 'delete objects',
                autoHiding: 10000,
                title: 'Objects have been permanently deleted.',
            });
        });
}

function moveObjectsIntoTrash(multipleInfo: MulipleInfoItem[], transaction: string, login: string) {
    const setAttributesRequests: BatchSubRequest[] = map_(multipleInfo, (node) => {
        const restorePath = prepareRestorePath(node.path, node.type);

        return {
            command: 'set',
            parameters: {
                transaction_id: transaction,
                path: preparePath(node.path) + '/@_restore_path',
                input_format: {
                    $value: 'json',
                    $attributes: {
                        encode_utf8: 'false',
                    },
                },
            },
            input: restorePath,
        };
    });

    const moveRequests: BatchSubRequest[] = map_(multipleInfo, (node) => {
        const path = preparePath(node.path);
        const destinationPath = createDestinationPath(node.account, node.name, login);

        return {
            command: 'move',
            parameters: {
                transaction_id: transaction,
                source_path: path,
                recursive: true,
                preserve_account: true,
                destination_path: destinationPath,
            },
        };
    });

    return wrapBatchPromise(
        executeBatchWithRetries(YTApiId.navigationMoveToTrashRestorePath, setAttributesRequests, {
            errorTitle: 'Failed to set restore path',
        }),
        'Failed to set restore path',
    )
        .then(() =>
            wrapBatchPromise(
                executeBatchWithRetries(YTApiId.navigationMoveToTrash, moveRequests, {
                    errorTitle: 'Failed to move the object(s) to trash',
                }),
                'Failed to move the object(s) to trash',
            ),
        )
        .then(() => yt.v3.commitTransaction({transaction_id: transaction}))
        .then(() => {
            toaster.add({
                theme: 'success',
                name: 'delete objects',
                autoHiding: 10000,
                title: 'Objects moved',
                content: (
                    <div>
                        Objects have been moved to the trash, they might be found at
                        <br />
                        <Link url={'navigation?path=//tmp/trash/by-account/'}>
                            {'//tmp/trash/by-account/...'}
                        </Link>
                    </div>
                ),
            });
        });
}

export function deleteObjects() {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const {navigation, global} = getState();
        const {transaction} = navigation.navigation;
        const {permanently, multipleInfo} = navigation.modals.deleteObject;
        const {login} = global;

        if (transaction) {
            dispatch({type: CLOSE_DELETE_OBJECT_POPUP});

            toaster.add({
                theme: 'danger',
                name: 'delete object',
                autoHiding: 10000,
                title: 'Could not delete the object within transaction.',
            });
        }

        dispatch({type: DELETE_OBJECT.REQUEST});

        return yt.v3
            .startTransaction({})
            .then((id: string) => {
                if (permanently) {
                    return permanentlyDeleteObjects(multipleInfo, id);
                }

                return moveObjectsIntoTrash(multipleInfo, id, login);
            })
            .then(() => {
                dispatch({type: DELETE_OBJECT.SUCCESS});
                dispatch({type: CLOSE_DELETE_OBJECT_POPUP});
                dispatch(updateView());
            })
            .catch((error: YTError) => {
                console.error(error);
                dispatch({
                    type: DELETE_OBJECT.FAILURE,
                    data: {error},
                });
                toaster.add({
                    theme: 'danger',
                    name: 'delete objects',
                    autoHiding: 10000,
                    title: 'Could not delete the nodes.',
                    content: error.message,
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
            });
    };
}
