import {
    OPEN_RESTORE_POPUP,
    RESTORE_OBJECT,
} from '../../../../constants/navigation/modals/restore-object';
import {
    showErrorInModal,
    openEditingPopup,
} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {findCorrectObjectName} from '../../../../utils/navigation/restore-object';
import {NetworkCode} from '../../../../constants/navigation/modals/path-editing-popup';
import {Toaster} from '@gravity-ui/uikit';
import {preparePath} from '../../../../utils/navigation';
import Link from '../../../../components/Link/Link';
import {showErrorPopup} from '../../../../utils/utils';
import {updateView} from '../index';
import ypath from '../../../../common/thor/ypath';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import React from 'react';
import _ from 'lodash';
import {executeBatchWithRetries} from '../../execute-batch';
import {YTApiId} from '../../../../rum/rum-wrap-api';

const toaster = new Toaster();

function checkError(responses) {
    const error = _.find(responses, (res) => res.error);
    if (error) {
        return Promise.reject(error.error);
    }

    return Promise.resolve(responses);
}

export function restoreObjects(items) {
    return (dispatch) => {
        dispatch({type: RESTORE_OBJECT.REQUEST});
        return yt.v3
            .startTransaction({})
            .then((id) => {
                const requests = _.map(items, (node) => {
                    const restorePath = ypath.getValue(node, '/@_restore_path');
                    return {
                        command: 'move',
                        parameters: {
                            transaction_id: id,
                            source_path: preparePath(node.path),
                            destination_path: restorePath,
                        },
                    };
                });

                return executeBatchWithRetries(YTApiId.navigationRestorePath, requests)
                    .then(checkError)
                    .then(() => yt.v3.commitTransaction({transaction_id: id}))
                    .catch((err) =>
                        yt.v3
                            .abortTransaction({transaction_id: id})
                            .then(() => Promise.reject(err)),
                    );
            })
            .then(() => {
                dispatch({type: RESTORE_OBJECT.SUCCESS});
                dispatch(updateView());

                toaster.createToast({
                    type: 'success',
                    name: 'restore objects',
                    timeout: 10000,
                    title: 'Objects restored',
                    content: 'Objects have been successfully restored',
                });
            })
            .catch((err) => {
                dispatch({type: RESTORE_OBJECT.FAILURE});

                toaster.createToast({
                    name: 'restore objects',
                    type: 'error',
                    allowAutoHiding: false,
                    title: 'Could not restore objects.',
                    content: err?.message || 'Oops, something went wrong',
                    actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
                });
            });
    };
}

export function restoreObject(objectPath, restorePath, onSuccess) {
    return (dispatch, getState) => {
        dispatch({type: RESTORE_OBJECT.REQUEST});

        return yt.v3
            .move({
                source_path: preparePath(objectPath),
                destination_path: restorePath,
            })
            .then(() => {
                dispatch({type: RESTORE_OBJECT.SUCCESS});

                if (typeof onSuccess === 'function') {
                    onSuccess(objectPath, restorePath);
                }

                toaster.createToast({
                    type: 'success',
                    name: 'restore object',
                    timeout: 10000,
                    title: 'Object restored',
                    content: (
                        <div>
                            Object has been successfully{' '}
                            <Link url={`navigation?path=${restorePath}`}>restored</Link>
                        </div>
                    ),
                });
            })
            .catch((error) => {
                dispatch({type: RESTORE_OBJECT.FAILURE});

                const isModalOpen = getState().navigation.modals.restoreObject.popupVisible;

                if (isModalOpen) {
                    const action = showErrorInModal(error);

                    dispatch(action);
                } else {
                    switch (error.code) {
                        case NetworkCode.EXIST: {
                            findCorrectObjectName(restorePath)
                                .then((correctRestorePath) => {
                                    const action = openEditingPopup(
                                        objectPath,
                                        correctRestorePath,
                                        OPEN_RESTORE_POPUP,
                                    );

                                    dispatch(action);
                                })
                                .catch(showErrorPopup);
                            break;
                        }
                        case NetworkCode.INCORRECT_PATH: {
                            const openAction = openEditingPopup(
                                objectPath,
                                restorePath,
                                OPEN_RESTORE_POPUP,
                            );
                            const errorAction = showErrorInModal(error);

                            dispatch(errorAction);
                            dispatch(openAction);
                            break;
                        }
                        default:
                            showErrorPopup(error);
                            break;
                    }
                }
            });
    };
}
