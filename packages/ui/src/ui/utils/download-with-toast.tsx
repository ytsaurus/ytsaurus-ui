import React, {type ReactNode} from 'react';
import {Text} from '@gravity-ui/uikit';
import axios from 'axios';

import {isPlainObject} from '../../shared/utils/toolkit';

import {type YTError} from '../types';
import {toaster} from './toaster';
import {showErrorPopup} from './utils';

type DownloadWithToastParams = {
    name: string;
    download: () => Promise<void>;
    loadingTitle: string;
    loadingContent?: ReactNode;
    successTitle: string;
    errorTitle: string;
    fallbackErrorMessage: string;
    detailsLabel: string;
};

async function getDownloadError(error: unknown, fallbackMessage: string): Promise<YTError> {
    if (axios.isAxiosError<Blob>(error) && error.response?.data instanceof Blob) {
        const body = await error.response.data.text().catch(() => '');

        if (body) {
            try {
                const data: unknown = JSON.parse(body);

                if (isPlainObject(data) && typeof data.message === 'string' && data.message) {
                    return {...data, message: data.message};
                }
            } catch {
                // A download error can have a plain-text body.
            }

            return {message: body};
        }
    }

    return {message: error instanceof Error && error.message ? error.message : fallbackMessage};
}

export async function downloadWithToast(params: DownloadWithToastParams): Promise<YTError | null> {
    const {name, download, loadingTitle, loadingContent, successTitle, errorTitle, detailsLabel} =
        params;

    toaster.add({
        name,
        title: loadingTitle,
        theme: 'info',
        content: loadingContent,
        autoHiding: false,
    });

    try {
        await download();
    } catch (error) {
        const downloadError = await getDownloadError(error, params.fallbackErrorMessage);

        toaster.update(name, {
            title: errorTitle,
            theme: 'danger',
            content: <Text>{downloadError.message}</Text>,
            actions: [
                {
                    label: detailsLabel,
                    onClick: () => showErrorPopup(downloadError, {hideOopsMsg: true}),
                },
            ],
            autoHiding: false,
        });

        return downloadError;
    }

    toaster.update(name, {
        title: successTitle,
        theme: 'success',
        autoHiding: 5000,
    });

    return null;
}
