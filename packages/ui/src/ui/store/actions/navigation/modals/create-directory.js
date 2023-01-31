import React from 'react';
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {Toaster} from '@gravity-ui/uikit';
import Link from '../../../../components/Link/Link';

import {
    CREATE_DIRECTORY,
    CREATE_MESSAGE,
} from '../../../../constants/navigation/modals/create-directory';
import {showErrorInModal} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {HIDE_ERROR} from '../../../../constants/navigation/modals/path-editing-popup';
import CancelHelper from '../../../../utils/cancel-helper';

const requests = new CancelHelper();
const toaster = new Toaster();

export function createDirectory(creatingPath, onSuccess) {
    return (dispatch) => {
        dispatch({type: CREATE_DIRECTORY.REQUEST});

        return yt.v3
            .create(
                {
                    path: creatingPath,
                    type: 'map_node',
                },
                requests.saveCancelToken,
            )
            .then(() => {
                dispatch({type: CREATE_DIRECTORY.SUCCESS});

                if (typeof onSuccess === 'function') {
                    onSuccess();
                }

                toaster.createToast({
                    name: CREATE_MESSAGE,
                    timeout: 10000,
                    type: 'success',
                    title: CREATE_MESSAGE,
                    content: <Link url={`navigation?path=${creatingPath}`}>{creatingPath}</Link>,
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({
                        type: CREATE_DIRECTORY.CANCELLED,
                    });
                } else {
                    dispatch({type: CREATE_DIRECTORY.FAILURE});

                    const action = showErrorInModal(error);

                    dispatch(action);
                }
            });
    };
}

export function abortRequests() {
    return (dispatch) => {
        requests.removeAllRequests();

        dispatch({type: HIDE_ERROR});
    };
}
