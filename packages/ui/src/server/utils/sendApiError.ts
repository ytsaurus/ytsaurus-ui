import {Response} from '@gravity-ui/expresskit';
import axios from 'axios';
import {ErrorWithCode, sendError} from './index';

export const sendApiError = (res: Response, error: unknown) => {
    let status;
    let message;

    if (axios.isAxiosError(error)) {
        status = error.response?.status;
        message = error.response?.statusText;
    } else if (error instanceof ErrorWithCode) {
        status = error.code;
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    if (status === 401) {
        status = 500;
        message = 'Authorization failed';
    }

    sendError(res, message, status || 500);
};
