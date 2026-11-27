import {type AxiosResponse} from 'axios';

export const copyFileToClipboard = async (response: AxiosResponse<Blob>): Promise<void> => {
    const fileContent = await response.data.text();

    await navigator.clipboard.writeText(fileContent);
};
