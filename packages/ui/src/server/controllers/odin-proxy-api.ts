import isEmpty_ from 'lodash/isEmpty';
import has_ from 'lodash/has';

import axios from 'axios';
import qs from 'qs';

import type {Request, Response} from 'express';
import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';

export async function odinProxyApi(req: Request, res: Response) {
    try {
        await odinProxyApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

async function odinProxyApiImpl(req: Request, res: Response) {
    const {action, ytAuthCluster: cluster} = req.params;
    const {odinBaseUrl} = req.ctx.config;
    const odinPath = typeof odinBaseUrl === 'string' ? odinBaseUrl : odinBaseUrl?.[cluster];

    if (!odinPath) {
        return sendAndLogError(req.ctx, res, 500, new Error('Odin base url is not configured'));
    }
    const {ctx, query} = req;

    const search = isEmpty_(query) ? '' : `?${qs.stringify(query)}`;

    const allowedActionsUrls: Record<string, string> = {
        service_list: `${odinPath}/service_list`,
        exists: `${odinPath}/${action}/${cluster}`,
        availability: `${odinPath}/${action}/${cluster}${search}`,
    };

    if (!has_(allowedActionsUrls, action)) {
        return sendAndLogError(
            req.ctx,
            res,
            400,
            new Error(`Odin action - ${action}, is not supported`),
        );
    }

    const url = allowedActionsUrls[action];

    return axios
        .request({
            url: url,
            method: req.method as any,
            headers: {...ctx.getMetadata(), 'accept-encoding': 'gzip'},
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
