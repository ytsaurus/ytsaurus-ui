import {
    OPEN_RESTORE_POPUP,
    RESTORE_OBJECT,
} from '../../../../constants/navigation/modals/restore-object';
import {
    openEditingPopup,
    showErrorInModal,
} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {findCorrectObjectName} from '../../../../utils/navigation/restore-object';
import {NetworkCode} from '../../../../constants/navigation/modals/path-editing-popup';
import {preparePath} from '../../../../utils/navigation';
import Link from '../../../../containers/Link/Link';
import {showErrorPopup, wrapBatchPromise} from '../../../../utils/utils';
import {updateView} from '../index';
import ypath from '../../../../common/thor/ypath';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import React from 'react';

import map_ from 'lodash/map';

import i18n from './i18n';
import {executeBatchWithRetries} from '../../execute-batch';
import {YTApiId} from '../../../../rum/rum-wrap-api';
import {toaster} from '../../../../utils/toaster';

export function restoreObjects(items) {
    return (dispatch) => {
        dispatch({type: RESTORE_OBJECT.REQUEST});
        return yt.v3
            .startTransaction({})
            .then((id) => {
                const requests = map_(items, (node) => {
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

                return wrapBatchPromise(
                    executeBatchWithRetries(YTApiId.navigationRestorePath, requests, {
                        errorTitle: i18n('alert_failed-to-get-restore-path'),
                    }),
                    i18n('alert_failed-to-get-restore-path'),
                )
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

                toaster.add({
                    theme: 'success',
                    name: 'restore objects',
                    timeout: 10000,
                    title: i18n('title_objects-restored'),
                    content: i18n('alert_objects-restored'),
                });
            })
            .catch((err) => {
                dispatch({type: RESTORE_OBJECT.FAILURE});

                toaster.add({
                    name: 'restore objects',
                    theme: 'danger',
                    autoHiding: false,
                    title: i18n('title_objects-restore-failed'),
                    content: err?.message || i18n('alert_something-went-wrong'),
                    actions: [{label: i18n('action_view'), onClick: () => showErrorPopup(err)}],
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

                toaster.add({
                    theme: 'success',
                    name: 'restore object',
                    timeout: 10000,
                    title: i18n('title_object-restored'),
                    content: (
                        <div>
                            {i18n('alert_object-restored')}{' '}
                            <Link url={`navigation?path=${restorePath}`}>
                                {i18n('action_restored')}
                            </Link>
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
