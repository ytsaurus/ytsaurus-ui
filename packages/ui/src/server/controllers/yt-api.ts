import axios, {AxiosError} from 'axios';
import type {Request, Response} from 'express';
import qs from 'qs';
import isEmpty_ from 'lodash/isEmpty';
// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';
import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import * as os from 'os';
import {getYtPageIdParts} from '../../shared/utils';
import {YT_API_REQUEST_ID_HEADER} from '../../shared/constants';
import {getUserYTApiSetup} from '../components/requestsSetup';

const yt = ytLib();

interface Params {
    ytAuthCluster: string;
    version: string;
    command: string;
}

interface CommandConfig {
    heavy: boolean;
}

const YT_API_REQUEST_ID_HEADER_LOWER = YT_API_REQUEST_ID_HEADER.toLowerCase();

const YT_KNOWN_COMMANDS = new Set([
    'get_job_stderr',
    'get_job_input',
    'get_job_fail_context',
    'run_job_shell_command',
]);

const supportedCommands: Record<string, Map<string, CommandConfig>> = yt.getSupportedCommands();

export async function ytTvmApiHandler(req: Request, res: Response) {
    const {ctx, params} = req as any as Request<Params>;
    const {referer} = req.headers;

    async function sendError(e: Error | AxiosError, statusCode: number | null = null) {
        await sendAndLogError(ctx, res, statusCode, e, {
            method: 'nodejs',
            query: req.query,
            page: referer,
        });
    }

    let cfg;
    try {
        cfg = getUserYTApiSetup(params.ytAuthCluster, req);
    } catch (e: any) {
        return sendError(e, 400);
    }
    const {setup, authHeaders, isLocalCluster} = cfg;

    const {[params.version]: clusterApi} = supportedCommands;
    if (!clusterApi) {
        return sendError(new Error(`Unexpected api version: [${params.version}]`), 400);
    }

    const commandInfo = clusterApi.get(params.command);
    if (!commandInfo && !YT_KNOWN_COMMANDS.has(params.command)) {
        return sendError(new Error(`Unexpected command: [${params.command}]`), 400);
    }

    const action = `${params.version}/${params.command}`;
    const timeStart = Date.now();

    const {[YT_API_REQUEST_ID_HEADER_LOWER]: ytApiId} = req.headers;

    function sendStats(overrides: {
        responseStatus: number;
        headerContentLength?: string;
        pipedDataSize?: number;
    }) {
        const timestamp = Date.now();
        const {headerContentLength} = overrides;
        const contentLength = Number(headerContentLength);
        ctx.stats?.('ytRequests', {
            ...overrides,
            headerContentLength: isNaN(contentLength) ? 0 : contentLength,
            timestamp,
            host: os.hostname(),
            service: setup.id,
            requestTime: timestamp - timeStart,
            requestId: req.id,
            action: (ytApiId as string) || action,
            referer: referer ?? '',
            page: !referer ? '' : getYtPageIdParts(referer).getPage(),
        });
    }

    try {
        const {proxy, secure} = setup;
        const proto = secure ? 'https' : 'http';
        let requestProxy = proxy;
        if (commandInfo?.heavy && !isLocalCluster && !setup.disableHeavyProxies) {
            ctx.log(`Request heavy proxy for command '${params.command}'`);
            const res = await axios.request({
                method: 'GET',
                url: `${proto}://${proxy}/hosts`,
                headers: ctx.getMetadata(),
            });

            requestProxy = res.data[0];
        }

        const search = isEmpty_(req.query) ? '' : `?${qs.stringify(req.query)}`;
        const requestUrl = `${proto}://${requestProxy}/api/${action}${search}`;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {host, cookie, [YT_API_REQUEST_ID_HEADER_LOWER]: _apiId, ...rest} = req.headers;
        ctx.log('Request', {requestUrl, 'X-YT-Correlation-Id': req.id});

        await axios
            .request({
                url: requestUrl,
                method: req.method as any,
                headers: {
                    ...ctx.getMetadata(),
                    ...rest,
                    'accept-encoding': 'gzip',
                    'X-YT-Correlation-Id': req.id,
                    'X-YT-Suppress-Redirect': '1',
                    ...authHeaders,
                },
                data: req.body,
                timeout: 100000,
                responseType: 'stream',
            })
            .then(async (response) => {
                const pipedSize = await pipeAxiosResponse(ctx, res, response);
                if (!pipedSize) {
                    throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
                }
                sendStats({...pipedSize, responseStatus: response.status});
            });
    } catch (e) {
        try {
            await sendError(e as any, 500);
        } catch {}
        sendStats({
            responseStatus: (e as AxiosError)?.response?.status || 500,
        });
    }
}
