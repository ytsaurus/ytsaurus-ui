import {AxiosResponse} from 'axios';

export const copyFileToClipboard = async (response: AxiosResponse): Promise<void> => {
    const contentType = response.headers['content-type'] ?? '';
    const blob = new Blob([response.data], {type: String(contentType)});
    const fileContent = await blob.text();

    await navigator.clipboard.writeText(fileContent);
};
