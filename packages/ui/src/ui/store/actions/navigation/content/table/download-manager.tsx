import React from 'react';
import {ThunkAction} from 'redux-thunk';
import {UnknownAction} from 'redux';
import {Text, Toaster} from '@gravity-ui/uikit';
import axios from 'axios';

import {AppStoreProvider} from '../../../../../containers/App/AppStoreProvider';
import {DownloadShortInfo} from '../../../../../pages/navigation/content/Table/DownloadManager/DownloadShortInfo/DownloadShortInfo';

import {RootState} from '../../../../reducers';
import {downloadManagerActions} from '../../../../reducers/navigation/content/table/download-manager';

import {downloadFileFromResponse} from '../../../../../utils/download-file';

const requestDownloadFile = async (url: string) =>
    axios({
        method: 'get',
        url: url,
        responseType: 'blob',
        withCredentials: true,
    });

const toaster = new Toaster();

const HIDING_TIMING = 5000;

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
        } catch (error: any) {
            let errorMessage = error;
            if (error.response) {
                const errorText = await error.response.data.text();
                errorMessage = JSON.parse(errorText).message;
            }

            dispatch(downloadManagerActions.onFailure({id, error}));
            updateToaster(id, 'failure', {errorMessage});
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
        errorMessage?: string;
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
            content: <Text>{options?.errorMessage || ''}</Text>,
            autoHiding: HIDING_TIMING,
        });
    }
};
