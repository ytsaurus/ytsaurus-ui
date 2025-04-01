import type {Request, Response} from 'express';

import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import axios from 'axios';

const BASE_URL = 'http://ma-efremoff.ui.yandex-team.ru:9090';

export async function prometheusQueryRange(req: Request, res: Response) {
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
