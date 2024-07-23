import isEmpty_ from 'lodash/isEmpty';
import axios from 'axios';
import qs from 'qs';

import type {Request, Response} from 'express';
import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import {getUserYTApiSetup} from '../components/requestsSetup';

export async function ytProxyApi(req: Request, res: Response) {
    try {
        await ytProxyApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

const ALLOWED_ACTION: Record<string, string> = {
    ['hosts-all']: '/hosts/all',
    ['internal-discover_versions']: '/internal/discover_versions/v2',
};

async function ytProxyApiImpl(req: Request, res: Response) {
    const {ctx, query} = req;
    const {command, ytAuthCluster} = req.params;

    const proxyAction = ALLOWED_ACTION[command];
    if (!proxyAction) {
        throw new Error('Unexpected action ' + command);
    }

    const search = isEmpty_(query) ? '' : `?${qs.stringify(query)}`;

    let cfg;
    try {
        cfg = getUserYTApiSetup(ytAuthCluster, req);
    } catch (e: any) {
        return sendAndLogError(req.ctx, res, 400, e);
    }

    const {authHeaders, proxyBaseUrl} = cfg;

    return axios
        .request({
            url: `${proxyBaseUrl}${proxyAction}${search}`,
            method: req.method as any,
            headers: {...ctx.getMetadata(), ...authHeaders, 'accept-encoding': 'gzip'},
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
