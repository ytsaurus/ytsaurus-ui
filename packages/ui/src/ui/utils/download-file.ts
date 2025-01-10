import {AxiosResponse} from 'axios';

export const downloadFileFromResponse = (filename: string, response: AxiosResponse): void => {
    const contentType = response.headers['content-type'] ?? '';
    const blob = new Blob([response.data], {
        type: String(contentType),
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
    window.URL.revokeObjectURL(link.href);
    link.remove();
};
