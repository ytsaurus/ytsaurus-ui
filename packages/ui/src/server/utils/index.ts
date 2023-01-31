import * as stream from 'stream';
import _ from 'lodash';
import type {Response} from 'express';
import {AxiosError, AxiosResponse} from 'axios';
import {AppContext} from '@gravity-ui/nodekit';
import {isYTError} from '../../shared/utils';
import {getApp} from '../ServerFactory';

const path = require('path');

export function isProductionEnv() {
    return getApp().config.appEnv !== 'development';
}

export function isLocalModeByEnvironment() {
    return process.env.APP_ENV === 'local';
}

export function getInterfaceVersion() {
    if (isProductionEnv()) {
        const {INIT_CWD} = process.env;
        const packageJsonPath = INIT_CWD
            ? path.resolve(INIT_CWD, 'package.json')
            : path.resolve(__dirname, '../../../package.json');
        /* eslint-disable-next-line global-require, security/detect-non-literal-require */
        return require(packageJsonPath).version;
    } else {
        return 'local';
    }
}

export function prepareErrorToSend(e: unknown) {
    let message = '';
    if (e instanceof Error) {
        message = _.toString(e);
    } else if (isYTError(e)) {
        return e;
    } else {
        message = JSON.stringify(e);
    }
    return {message};
}

export function sendResponse(res: Response, data: object) {
    return res.set('content-type', 'application/json').status(200).send(JSON.stringify(data));
}

export function sendError(res: Response, error: unknown, errCode = 500) {
    const errData = prepareErrorToSend(error);
    return res.set('content-type', 'application/json').status(errCode).send(errData);
}

function asAxiosError<T>(e: Error | AxiosError<T>): AxiosError<T> | undefined {
    return (e as AxiosError).isAxiosError ? (e as AxiosError<T>) : undefined;
}

export const UNEXPECTED_PIPE_AXIOS_RESPONSE =
    'Unexpected behavior: response.data should be an instance of stream.Readable';
export const UNEXPECTED_PIPE_AXIOS_ERROR =
    'Unexpected behavior: e.response.data should be an instance of stream.Readable';

export async function pipeAxiosErrorOrFalse(ctx: AppContext, dst: Response, e: AxiosError) {
    return await pipeAxiosResponse(ctx, dst, e.response, '[Send error]');
}

interface PipedResponseSize {
    headerContentLength?: string;
    pipedDataSize: number;
}

const LOG_HEADERS = ['x-yt-proxy', 'x-yt-request-id', 'x-yt-trace-id', 'content-length'];

export async function pipeAxiosResponse(
    ctx: AppContext,
    dst: Response,
    src?: AxiosResponse<stream.Readable>,
    logMsgPrefix = '',
    transformHeaders: (headers: any) => typeof headers = (v) => v,
): Promise<PipedResponseSize | undefined> {
    if (src?.data instanceof stream.Readable) {
        return await pipeResponse(
            logMsgPrefix,
            ctx,
            dst,
            src.data,
            src.headers,
            src.status,
            transformHeaders,
        );
    } else {
        return Promise.resolve(undefined);
    }
}

export async function pipeResponse(
    logMsgPrefix: string,
    ctx: AppContext,
    dst: Response,
    data: stream.Readable,
    headers?: any,
    status?: number,
    transformHeaders: (headers: any) => typeof headers = (v) => v,
) {
    dst.status(status ?? 500);

    _.forEach(transformHeaders(headers), (value, key) => {
        if (key !== 'content-length' && key !== 'vary' && key !== 'www-authenticate') {
            dst.setHeader(key, value);
        }
    });

    const headersToLog = _.pick(headers, LOG_HEADERS);
    ctx.log(logMsgPrefix + ' Headers', headersToLog);

    const pipedDataSize = await pipeReadableToWriteable(ctx, dst, data, logMsgPrefix);
    return {headerContentLength: headers['content-length'], pipedDataSize};
}

export async function pipeReadableToWriteable(
    ctx: AppContext,
    dst: stream.Writable,
    src: stream.Readable,
    logMsgPrefix: string,
) {
    let firstChunk = true;
    let pipedDataSize = 0;
    const closePromise = new Promise<void>((resolve, reject) => {
        src.on('data', (chunk) => {
            if (firstChunk) {
                ctx.log(logMsgPrefix + ' TTFB');
                firstChunk = false;
            }
            pipedDataSize += chunk?.length;
        });
        src.on('error', (e: any) => {
            resolve = () => {};
            reject(e);
        });
        src.on('close', () => {
            ctx.log(logMsgPrefix + ' Response stream closed', {
                pipedDataSize,
            });
            resolve();
        });
    });
    src.pipe(dst);
    await closePromise;

    return pipedDataSize;
}

export async function sendAndLogError(
    ctx: AppContext,
    res: Response,
    status: number | null,
    e: Error | AxiosError,
    extra: any = {},
) {
    const ae = asAxiosError(e);
    if (ae) {
        ctx.logError('AxiosError', ae.toJSON(), extra);
        if (await pipeAxiosErrorOrFalse(ctx, res, ae)) {
            return;
        }

        if (ae.response?.status) {
            _.forEach(ae.response.headers, (value, key) => {
                res.append(key, value);
            });
            return res.status(ae.response.status).send(ae.response.data || ae.response.statusText);
        }

        return res.status(504).send({message: _.toString(e)});
    }

    ctx.logError('Error', e, extra);

    if (e instanceof Error) {
        return res.status(status || 500).send({message: _.toString(e)});
    }

    if (typeof e === 'string') {
        return res.status(status || 500).send({mesasge: e});
    }

    if (isYTError(e)) {
        return res.status(status || 500).send(e);
    }

    return res.status(status || 500).send({message: JSON.stringify(e)});
}
