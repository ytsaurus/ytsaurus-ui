import type {Request, Response} from 'express';

import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import axios from 'axios';

export async function prometheusQueryRange(req: Request, res: Response) {
    const BASE_URL = req.ctx.config.prometheusBaseUrl;

    try {
        await axios
            .get(`${BASE_URL}/api/v1/query_range?`, {
                params: req.query,
                responseType: 'stream',
            })
            .then(async (response) => {
                const pipedSize = await pipeAxiosResponse(req.ctx, res, response);
                if (!pipedSize) {
                    throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
                }
            });
    } catch (e: any) {
        sendAndLogError(req.ctx, res, null, e);
    }
}
