import isEmpty_ from 'lodash/isEmpty';
import axios from 'axios';
import qs from 'qs';

import type {Request, Response} from 'express';
import {
    ErrorWithCode,
    UNEXPECTED_PIPE_AXIOS_RESPONSE,
    pipeAxiosResponse,
    sendAndLogError,
} from '../utils';
import {getUserTabletErrorApiSetup} from '../components/requestsSetup';

import {
    TABLET_ERRORS_MANAGER_POST_ACTIONS,
    TabletErrorsApi,
    TabletErrorsManagerPostActionType,
} from '../../shared/tablet-errors-manager';

export async function ytTabletErrorsApi(req: Request, res: Response) {
    try {
        await ytTabletErrorsApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

function isTabletErrorsManagerPostAction(v: string): v is TabletErrorsManagerPostActionType {
    return TABLET_ERRORS_MANAGER_POST_ACTIONS.has(v as any);
}

async function ytTabletErrorsApiImpl(req: Request, res: Response) {
    const {ctx, query} = req;
    const {tabletErrorsBaseUrl} = ctx.config;
    if (!tabletErrorsBaseUrl) {
        throw new ErrorWithCode(
            404,
            'The installation of UI is not configured to work with TabletErrorsManager, check your config.tabletErrorsBaseUrl',
        );
    }

    const {action, ytAuthCluster} = req.params;

    if (!isTabletErrorsManagerPostAction(action)) {
        throw new ErrorWithCode(404, 'Unexpected action: ' + action);
    }

    const search = isEmpty_(query) ? '' : `?${qs.stringify(query)}`;

    let cfg;
    try {
        cfg = getUserTabletErrorApiSetup(ytAuthCluster, req);
    } catch (e: any) {
        return sendAndLogError(req.ctx, res, 400, e);
    }

    const {authHeaders} = cfg;

    return axios
        .request({
            url: `${tabletErrorsBaseUrl}/${action}${search}`,
            method: req.method as any,
            headers: {...ctx.getMetadata(), ...authHeaders, 'accept-encoding': 'gzip'},
            data: req.body as TabletErrorsApi[typeof action]['body'],
            timeout: 100000,
            responseType: 'stream',
        })
        .then(async (response) => {
            const pipedSize = await pipeAxiosResponse<TabletErrorsApi[typeof action]['response']>(
                ctx,
                res,
                response,
            );
            if (!pipedSize) {
                throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
            }
        });
}
