import React, {type ReactNode} from 'react';
import {Text} from '@gravity-ui/uikit';

import {type YTError} from '../../types';
import {toaster} from '../toaster';
import {showErrorPopup} from '../utils';

import {type DownloadFileParams, downloadFile} from './downloadFile';
import i18n from './i18n';

export const TOAST_HIDE_TIMEOUT = 5000;

const updateToaster = (
    name: string,
    status: 'loading' | 'success' | 'failure',
    options?: DownloadToastOptions,
    error?: YTError,
): void => {
    const {loadingTitle, successTitle, errorTitle, content} = options ?? {};

    if (status === 'loading') {
        toaster.add({
            title: loadingTitle ?? i18n('title_downloading'),
            name,
            theme: 'info',
            content,
            autoHiding: false,
        });
    }

    if (status === 'success') {
        toaster.update(name, {
            title: successTitle ?? i18n('title_success'),
            theme: 'success',
            autoHiding: TOAST_HIDE_TIMEOUT,
        });
    }

    if (status === 'failure') {
        const actions = error
            ? [
                  {
                      label: i18n('action_show-details'),
                      onClick: () => showErrorPopup(error, {hideOopsMsg: true}),
                  },
              ]
            : undefined;

        toaster.update(name, {
            title: errorTitle ?? i18n('title_failure'),
            theme: 'danger',
            content: <Text>{error?.message || i18n('alert_failed-to-download')}</Text>,
            autoHiding: false,
            actions,
        });
    }
};

type DownloadToastOptions = {
    loadingTitle?: string;
    successTitle?: string;
    errorTitle?: string;
    content?: ReactNode;
};

type DownloadFileWithToastParams = DownloadFileParams & {
    toast: DownloadToastOptions & {name: string};
};

/**
 * Shows a download toast and updates it when the file has been handled or an error occurs.
 * @param params Download parameters and toast options.
 * @returns Completion of the download lifecycle.
 */
export const downloadFileWithToast = async (params: DownloadFileWithToastParams): Promise<void> => {
    const {toast, request, download, onSuccess, onError, onComplete} = params;
    const {name, ...options} = toast;

    try {
        updateToaster(name, 'loading', options);

        await downloadFile({
            request,
            download,
            onSuccess: (response) => {
                onSuccess?.(response);
                updateToaster(name, 'success', options);
            },
            onError: (error) => {
                onError?.(error);
                updateToaster(name, 'failure', options, error);
            },
        });
    } finally {
        onComplete?.();
    }
};
