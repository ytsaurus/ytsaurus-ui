import React from 'react';
import {ThunkAction} from 'redux-thunk';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {Dispatch} from 'redux';

import {Toaster} from '@gravity-ui/uikit';
import Link from '../../../../components/Link/Link';

import {
    CREATE_DIRECTORY,
    CREATE_MESSAGE,
} from '../../../../constants/navigation/modals/create-directory';
import {
    hideError,
    showErrorInModal,
} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {HIDE_ERROR} from '../../../../constants/navigation/modals/path-editing-popup';
import CancelHelper from '../../../../utils/cancel-helper';
import {RootState} from '../../../../store/reducers';

const requests = new CancelHelper();
const toaster = new Toaster();

export function createDirectory(
    {path, recursive}: {path: string; recursive?: boolean},
    onSuccess: () => void,
) {
    return (dispatch: Dispatch) => {
        dispatch({type: CREATE_DIRECTORY.REQUEST});

        return yt.v3
            .create(
                {
                    path: path,
                    recursive,
                    type: 'map_node',
                },
                requests.saveCancelToken,
            )
            .then(() => {
                dispatch({type: CREATE_DIRECTORY.SUCCESS});

                if (typeof onSuccess === 'function') {
                    onSuccess();
                }

                toaster.add({
                    name: CREATE_MESSAGE,
                    autoHiding: 10000,
                    type: 'success',
                    title: CREATE_MESSAGE,
                    content: <Link url={`navigation?path=${path}`}>{path}</Link>,
                });
            })
            .catch((error: any) => {
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

export function clearCreateDirectoryError(): ThunkAction<void, RootState, unknown, any> {
    return (dispatch: Dispatch) => {
        dispatch(hideError());
    };
}

export function abortRequests() {
    return (dispatch: Dispatch) => {
        requests.removeAllRequests();

        dispatch({type: HIDE_ERROR});
    };
}
