import _ from 'lodash';
import axios from 'axios';

import type {Request, Response} from 'express';
import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import {getApp} from '../ServerFactory';
import {getUserYTApiSetup} from '../components/requestsSetup';

export async function chytProxyApi(req: Request, res: Response) {
    try {
        await chytProxyApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

async function chytProxyApiImpl(req: Request, res: Response) {
    const baseUrl = getApp().config?.chytApiBaseUrl;
    if (!baseUrl) {
        return sendAndLogError(req.ctx, res, 500, new Error('chytApiBaseUrl is not configured'));
    }
    const {ctx} = req;

    const {action, cluster} = req.params;

    const ALLOWED_ACTIONS = new Set([
        'list',
        'create',
        'remove',
        'start',
        'stop',
        'status',
        'describe_options',
        'set_options',
    ]);

    if (!ALLOWED_ACTIONS.has(action)) {
        return sendAndLogError(
            req.ctx,
            res,
            400,
            new Error(`CHYT action - '${action}', is not supported`),
        );
    }

    const {authHeaders} = getUserYTApiSetup(cluster, req);
    const headers = {
        ...ctx.getMetadata(),
        'accept-encoding': 'gzip',
        ...authHeaders,
        accept: 'application/json',
    };

    return axios
        .request({
            url: `${baseUrl}/${cluster}/${action}`,
            method: 'POST',
            headers,
            data: req.body,
            timeout: 100000,
            responseType: 'stream',
        })
        .then(async (response) => {
            const pipedSize = await pipeAxiosResponse(ctx, res, response);
            if (!pipedSize) {
                throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
            }
        });
}
