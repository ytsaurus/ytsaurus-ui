// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import axios from 'axios';
import isEmpty_ from 'lodash/isEmpty';
import qs from 'qs';
import type {Request, Response} from '../../@types/core';
import {getPreloadedClusterUiConfig} from '../components/cluster-params';
import ServerFactory from '../ServerFactory';
import {
    ErrorWithCode,
    UNEXPECTED_PIPE_AXIOS_RESPONSE,
    pipeAxiosResponse,
    sendAndLogError,
} from '../utils';

export async function ytAccessLogApi(req: Request, res: Response) {
    try {
        await ytAccessLogApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

function getAccessLogParams(req: Request) {
    const {ytAuthCluster: cluster} = req.params;
    const isDeveloper = req.cookies.ui_config_mode === 'developer';
    return {cluster, isDeveloper};
}

export async function ytAccesLogCheckAvailable(req: Request, res: Response) {
    try {
        const accessLogParams = getAccessLogParams(req);
        const {baseUrl} = await ytAccessLogGetBaseUrl(req, accessLogParams);
        res.send({is_access_log_available: Boolean(baseUrl)});
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

async function ytAccessLogGetBaseUrl(
    req: Request,
    {cluster, isDeveloper}: {cluster: string; isDeveloper: boolean},
): Promise<{baseUrl?: string; testing?: boolean}> {
    let {access_log_base_url: baseUrl} = await getPreloadedClusterUiConfig(
        cluster,
        req.ctx,
        isDeveloper,
    );

    if (!baseUrl) {
        baseUrl = req.ctx.config.uiSettings.accessLogBasePath;
    }

    if (!baseUrl) {
        return {};
    }

    const testing = ypath.get(baseUrl, '/@testing');
    return {
        baseUrl: typeof baseUrl === 'string' ? baseUrl : baseUrl?.$value,
        testing,
    };
}

const ALLOWED_ACTIONS = new Set(['ready', 'visible-time-range', 'access_log', 'qt_access_log']);

async function ytAccessLogApiImpl(req: Request, res: Response) {
    const {action} = req.params;

    if (!ALLOWED_ACTIONS.has(action)) {
        throw new ErrorWithCode(404, 'Action is not allowed');
    }

    const {cluster, isDeveloper} = getAccessLogParams(req);
    const {baseUrl, testing} = await ytAccessLogGetBaseUrl(req, {cluster, isDeveloper});

    if (!baseUrl) {
        throw new ErrorWithCode(
            404,
            'The installation of UI is not configured for access log viewer, check your config.uiSettings.accessLogBasePath',
        );
    }

    const authType = testing ? 'accessLogTest' : 'accessLogProd';
    const authHeaders = ServerFactory.getAuthHeaders(authType, req);

    const search = isEmpty_(req.query) ? '' : `?${qs.stringify(req.query)}`;
    return axios
        .request({
            url: `${baseUrl}/${action}${search}`,
            method: req.method as any,
            headers: {...req.ctx.getMetadata(), ...authHeaders, 'accept-encoding': 'gzip'},
            data: req.body,
            timeout: 100000,
            responseType: 'stream',
        })
        .then(async (response) => {
            const pipedSize = await pipeAxiosResponse(req.ctx, res, response);
            if (!pipedSize) {
                throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
            }
        });
}
