import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios';

import {type YTError} from '../../types';

import i18n from './i18n';

const getDownloadError = async (cause: unknown): Promise<YTError> => {
    if (axios.isAxiosError(cause) && cause.response) {
        try {
            const error: YTError | null = JSON.parse(await cause.response.data.text());

            if (error) {
                return error;
            }
        } catch {
            // Fall back to a generic download error if the response body cannot be read as JSON.
        }
    }

    return {message: i18n('alert_unexpected-download-error')};
};

type DownloadRequestConfig = Omit<AxiosRequestConfig<unknown>, 'responseType'> & {
    url: string;
};

type DownloadRequestHandler = () => Promise<AxiosResponse<Blob>>;

type DownloadRequest = DownloadRequestConfig | DownloadRequestHandler;

export type DownloadFileParams = {
    request: DownloadRequest;
    download: (response: AxiosResponse<Blob>) => void | Promise<void>;
    onSuccess?: (response: AxiosResponse<Blob>) => void;
    onError?: (error: YTError) => void;
    onComplete?: () => void;
};

/**
 * Fetches a file, waits for response handling, and reports the outcome through callbacks.
 * @param params Request and lifecycle callbacks.
 * @returns Completion of the download lifecycle.
 */
export const downloadFile = async (params: DownloadFileParams): Promise<void> => {
    const {request, download, onSuccess, onError, onComplete} = params;

    try {
        const response =
            typeof request === 'function'
                ? await request()
                : await axios<Blob>({...request, responseType: 'blob'});

        await download(response);

        onSuccess?.(response);
    } catch (cause) {
        if (onError) {
            const error = await getDownloadError(cause);

            onError(error);
        }
    } finally {
        onComplete?.();
    }
};
