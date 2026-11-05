import {type Response} from '@gravity-ui/expresskit';
import OpenAI from 'openai';
import {sendError} from './index';
import {sendApiError} from './sendApiError';

export function sendOpenAIError(res: Response, error: unknown) {
    if (!(error instanceof OpenAI.APIError)) {
        return sendApiError(res, error);
    }

    if (error.status === 401) {
        return sendError(res, 'Authorization failed', 500);
    }

    return sendError(res, error.message, error.status || 500);
}
