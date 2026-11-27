import React from 'react';
import {type ThunkAction} from 'redux-thunk';
import {type UnknownAction} from 'redux';
import {v4 as uuidv4} from 'uuid';

import {DownloadShortInfo} from '../../../../../pages/navigation/content/Table/DownloadManager/DownloadShortInfo/DownloadShortInfo';

import {type RootState} from '../../../../reducers';
import {downloadManagerActions} from '../../../../reducers/navigation/content/table/download-manager';

import {
    TOAST_HIDE_TIMEOUT,
    copyFileToClipboard,
    downloadFileFromResponse,
    downloadFileWithToast,
} from '../../../../../utils/download';

export const downloadFile = (
    url: string,
    filename: string,
    copy?: boolean,
): ThunkAction<Promise<void>, RootState, any, UnknownAction> => {
    const id = uuidv4();

    return async (dispatch, _getState) => {
        dispatch(downloadManagerActions.onRequest({id}));

        await downloadFileWithToast({
            toast: {
                name: `downloadingFile_${id}`,
                content: <DownloadShortInfo id={id} filename={filename} />,
            },
            request: {url, withCredentials: true},
            download: async (response) => {
                if (copy) {
                    await copyFileToClipboard(response);
                } else {
                    downloadFileFromResponse(response, {filename});
                }
            },
            onSuccess: () => {
                dispatch(downloadManagerActions.onSuccess({id}));
            },
            onError: (error) => {
                dispatch(downloadManagerActions.onFailure({id, error}));
            },
            onComplete: () => {
                setTimeout(() => {
                    dispatch(downloadManagerActions.onCleanup({id}));
                }, TOAST_HIDE_TIMEOUT * 2);
            },
        });
    };
};
