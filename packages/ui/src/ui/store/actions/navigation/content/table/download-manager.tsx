import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {UnknownAction} from 'redux';
import {Text, Toaster} from '@gravity-ui/uikit';
import axios, {AxiosError} from 'axios';

import {AppStoreProvider} from '../../../../../containers/App/AppStoreProvider';
import {DownloadShortInfo} from '../../../../../pages/navigation/content/Table/DownloadManager/DownloadShortInfo/DownloadShortInfo';

import {RootState} from '../../../../reducers';
import {downloadManagerActions} from '../../../../reducers/navigation/content/table/download-manager';

import {downloadFileFromResponse} from '../../../../../utils/download-file';
import {showErrorPopup} from '../../../../../utils/utils';
import {YTError} from '../../../../../types';

const requestDownloadFile = async (url: string) =>
    axios({
        method: 'get',
        url: url,
        responseType: 'blob',
        withCredentials: true,
    });

const toaster = new Toaster();

const HIDING_TIMING = 5000;

const fallbackError = {
    message: 'An unexpected error occurred while downloading the file',
};

export const downloadFile = (
    url: string,
    filename: string,
): ThunkAction<Promise<void>, RootState, any, UnknownAction> => {
    const id = crypto.randomUUID();

    return async (dispatch, _getState) => {
        try {
            dispatch(downloadManagerActions.onRequest({id}));
            updateToaster(id, 'loading', {filename});

            const response = await requestDownloadFile(url);

            downloadFileFromResponse(filename, response);

            dispatch(downloadManagerActions.onSuccess({id}));
            updateToaster(id, 'success');
        } catch (e: unknown) {
            let error = fallbackError;
            if (e instanceof AxiosError && e.response) {
                error = JSON.parse(await e.response.data.text());
            }

            dispatch(downloadManagerActions.onFailure({id, error}));
            updateToaster(id, 'failure', {error});
        }

        setTimeout(() => {
            dispatch(downloadManagerActions.onCleanup({id}));
        }, HIDING_TIMING * 2);
    };
};

const updateToaster = (
    id: string,
    status: 'loading' | 'success' | 'failure',
    options?: {
        filename?: string;
        error?: YTError | AxiosError;
    },
) => {
    if (status === 'loading') {
        toaster.add({
            title: 'Downloading',
            name: `downloadingFile_${id}`,
            theme: 'info',
            content: (
                <AppStoreProvider>
                    <DownloadShortInfo id={id} filename={options?.filename || ''} />
                </AppStoreProvider>
            ),
            autoHiding: false,
        });
    }

    if (status === 'success') {
        toaster.update(`downloadingFile_${id}`, {
            title: 'Success',
            theme: 'success',
            autoHiding: HIDING_TIMING,
        });
    }

    if (status === 'failure') {
        toaster.update(`downloadingFile_${id}`, {
            title: 'Failure',
            theme: 'danger',
            content: <Text>{options?.error?.message || 'Failed to download file'}</Text>,
            autoHiding: false,
            actions: [
                {
                    label: 'Details',
                    onClick: () =>
                        showErrorPopup(options?.error || fallbackError, {
                            hideOopsMsg: true,
                        }),
                },
            ],
        });
    }
};
