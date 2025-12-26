import * as stream from 'stream';

import path from 'path';

import forEach_ from 'lodash/forEach';
import pick_ from 'lodash/pick';
import toString_ from 'lodash/toString';

import type {Response} from 'express';
import {AxiosError, AxiosResponse} from 'axios';
import {AppContext} from '@gravity-ui/nodekit';
import {isYTError} from '../../shared/utils';
import {getApp} from '../ServerFactory';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {UIBatchError} from '../../shared/utils/error';
import {YTError} from '../../@types/types';

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
            : path.resolve('./package.json');
        try {
            /* eslint-disable-next-line global-require, security/detect-non-literal-require */
            return require(packageJsonPath).version;
        } catch (e) {
            getApp().nodekit.ctx.logError(`Failed to get version from ${packageJsonPath}`, e, {
                INIT_CWD,
                packageJsonPath,
            });
            return 'unkonwn';
        }
    } else {
        return 'local';
    }
}

export function prepareErrorToSend(e: unknown) {
    const res: Record<string, any> = {
        message: '',
    };

    if (e instanceof Error) {
        res.message = toString_(e);
    } else if (isYTError(e)) {
        return e;
    } else {
        res.message = JSON.stringify(e);
    }

    return res;
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

/**
 * pipeAciosResponse is a helper function to forward stream-content to browser
 *
 * `ResponseDataT` just allows to declare response type, it affects nothing,
 * but allows link highlight connection between modules from src/ui and src/server
 */
export async function pipeAxiosResponse<ResponseDataT = unknown>(
    ctx: AppContext,
    dst: Response<ResponseDataT>,
    src?: AxiosResponse<stream.Readable | unknown>,
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

    forEach_(transformHeaders(headers), (value, key) => {
        if (key !== 'content-length' && key !== 'vary' && key !== 'www-authenticate') {
            dst.setHeader(key, value);
        }
    });

    const headersToLog = pick_(headers, LOG_HEADERS);
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
        ctx.logError('AxiosError', ae, extra);
        if (await pipeAxiosErrorOrFalse(ctx, res, ae)) {
            return;
        }

        if (ae.response?.status) {
            forEach_(ae.response.headers, (value, key) => {
                res.append(key, value);
            });
            return res.status(ae.response.status).send(ae.response.data || ae.response.statusText);
        }

        return res.status(504).send({message: toString_(e)});
    }

    ctx.logError('Error', e, extra);

    if (e instanceof ErrorWithCode) {
        return res.status(e.httpStatusCode).send(e);
    }

    if (e instanceof Error) {
        return res.status(status || 500).send({message: toString_(e)});
    }

    if (typeof e === 'string') {
        return res.status(status || 500).send({mesasge: e});
    }

    if (isYTError(e)) {
        return res.status(status || 500).send(e);
    }

    return res.status(status || 500).send({message: JSON.stringify(e)});
}

export const makeAuthClusterCookieName = (ytAuthCluster: string) => {
    return `${ytAuthCluster}_${YT_CYPRESS_COOKIE_NAME}`;
};

export class ErrorWithCode extends UIBatchError {
    httpStatusCode: number;

    constructor(httpStatusCode: number, error: string | YTError<{attributes?: object}>) {
        super(error);
        this.httpStatusCode = httpStatusCode;
    }
}
