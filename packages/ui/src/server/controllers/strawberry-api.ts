import axios from 'axios';

import type {Request, Response} from 'express';
import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import {getUserYTApiSetup} from '../components/requestsSetup';
import {getPreloadedClusterUiConfig} from '../components/cluster-params';

export async function strawberryProxyApi(req: Request, res: Response) {
    try {
        await strawberryProxyApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

const getBaseUrlConfigParameter = (engine: string) => {
    const CLUSTER_CONFIG_ENGINE_URL_MAP = {
        chyt: 'chyt_controller_base_url',
        spyt: 'livy_controller_base_url',
    } as const;

    if (!(engine in CLUSTER_CONFIG_ENGINE_URL_MAP)) return null;
    return CLUSTER_CONFIG_ENGINE_URL_MAP[engine as keyof typeof CLUSTER_CONFIG_ENGINE_URL_MAP];
};

async function strawberryProxyApiImpl(req: Request, res: Response) {
    const {action, engine, ytAuthCluster: cluster} = req.params;
    const ALLOWED_ACTIONS = new Set([
        'list',
        'create',
        'remove',
        'start',
        'stop',
        'get_brief_info',
        'describe_options',
        'edit_options',
        'get_speclet',
    ]);

    const baseUrlConfigParameter = getBaseUrlConfigParameter(engine);

    if (!baseUrlConfigParameter) {
        return sendAndLogError(req.ctx, res, 400, new Error('api engine is not supported'));
    }

    if (!ALLOWED_ACTIONS.has(action)) {
        return sendAndLogError(
            req.ctx,
            res,
            400,
            new Error(`${engine.toUpperCase()} action - '${action}', is not supported`),
        );
    }

    const isDeveloper = req.query.isDeveloper === 'true';
    const config = await getPreloadedClusterUiConfig(cluster, req.ctx, isDeveloper);
    const baseUrl = config[baseUrlConfigParameter];

    if (!baseUrl) {
        return sendAndLogError(
            req.ctx,
            res,
            500,
            new Error(`//sys/@ui_config/${baseUrlConfigParameter} is not defined`),
        );
    }
    const {ctx} = req;

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
