import {type AxiosResponse} from 'axios';

export const downloadFileFromResponse = (filename: string, response: AxiosResponse<Blob>): void => {
    // A generic mime type keeps browsers (e.g. Yandex Browser's built-in
    // Office document viewer) from intercepting the blob and offering to
    // open it in some viewer instead of saving it.
    const blob = new Blob([response.data], {
        type: 'application/octet-stream',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 30_000);
};
