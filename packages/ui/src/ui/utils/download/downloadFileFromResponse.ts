import {type AxiosResponse} from 'axios';

import {getContentDispositionFilename} from './getContentDispositionFilename';

type DownloadOptions = {
    filename?: string;
};

export const downloadFileFromResponse = (
    response: AxiosResponse<Blob>,
    options?: DownloadOptions,
): void => {
    // A generic mime type keeps browsers (e.g. Yandex Browser's built-in
    // Office document viewer) from intercepting the blob and offering to
    // open it in some viewer instead of saving it.
    const blob = new Blob([response.data], {
        type: 'application/octet-stream',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const contentDisposition = response.headers['content-disposition'];
    const filenameFromHeader =
        typeof contentDisposition === 'string'
            ? getContentDispositionFilename(contentDisposition)
            : undefined;

    link.href = url;
    link.download = options?.filename ?? filenameFromHeader ?? 'download';
    link.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 30_000);
};
