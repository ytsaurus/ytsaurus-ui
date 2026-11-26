import React from 'react';
import {type ThunkAction} from 'redux-thunk';
import {type UnknownAction} from 'redux';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

import {DownloadShortInfo} from '../../../../../pages/navigation/content/Table/DownloadManager/DownloadShortInfo/DownloadShortInfo';

import {type RootState} from '../../../../reducers';
import {downloadManagerActions} from '../../../../reducers/navigation/content/table/download-manager';

import {downloadFileFromResponse} from '../../../../../utils/download-file';
import {copyFileToClipboard} from '../../../../../utils/copy-file-to-clipboard';
import {downloadWithToast} from '../../../../../utils/download-with-toast';
import i18n from './i18n';

const requestDownloadFile = async (url: string) => {
    return axios<Blob>({
        method: 'get',
        url,
        responseType: 'blob',
        withCredentials: true,
    });
};

const DOWNLOAD_STATE_CLEANUP_DELAY = 10_000;

export const downloadFile = (
    url: string,
    filename: string,
    copy?: boolean,
): ThunkAction<Promise<void>, RootState, any, UnknownAction> => {
    const id = uuidv4();

    return async (dispatch, _getState) => {
        dispatch(downloadManagerActions.onRequest({id}));

        const error = await downloadWithToast({
            name: `downloadingFile_${id}`,
            loadingTitle: i18n('title_downloading'),
            loadingContent: <DownloadShortInfo id={id} filename={filename} />,
            successTitle: i18n('title_success'),
            errorTitle: i18n('title_failure'),
            fallbackErrorMessage: i18n('alert_unexpected-download-error'),
            detailsLabel: i18n('action_show-details'),
            download: async () => {
                const response = await requestDownloadFile(url);

                if (copy) {
                    await copyFileToClipboard(response);
                } else {
                    downloadFileFromResponse(filename, response);
                }

                dispatch(downloadManagerActions.onSuccess({id}));
            },
        });

        if (error) {
            dispatch(downloadManagerActions.onFailure({id, error}));
        }

        setTimeout(() => {
            dispatch(downloadManagerActions.onCleanup({id}));
        }, DOWNLOAD_STATE_CLEANUP_DELAY);
    };
};
