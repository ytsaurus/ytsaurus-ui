import type {Request, Response} from 'express';
import axios from 'axios';

import {YtauthConfig} from '../../@types/core';
import {AppContext} from '@gravity-ui/nodekit';
import {OauthConfig, UserInfo} from '../../shared/yt-types';
import {sendError, sendResponse} from '../utils';

export class YtauthError extends Error {}

export class BadTokenError extends YtauthError {
    constructor(code: number, response: string) {
        super(`Ytauth BadTokenError. Code = ${code}. Message = ${response}`);
    }
}

export class UnexpectedError extends YtauthError {
    constructor(message?: string, code?: number, response?: any, inner?: Error) {
        super(
            `Ytauth UnexpectedError. Message = "${message}", ` +
                `code = ${code}, response = ${JSON.stringify(response)}, inner = ${inner}`,
        );
    }
}

function parseUserInfo(data: any): UserInfo | undefined {
    if (!data || !data.username) {
        return undefined;
    }

    return {
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.avatar,
    };
}

function parseOauthConfig(data: any): OauthConfig | undefined {
    if (!data || !data.name || !data.image_url || !data.client_id || !data.authorize_url) {
        return undefined;
    }

    return {
        name: data.name,
        imageUrl: data.image_url,
        clientId: data.client_id,
        authorizeUrl: data.authorize_url,
    };
}

export async function ytauthAuthenticate(
    config: YtauthConfig,
    cookie: string,
    ctx: AppContext,
): Promise<UserInfo> {
    ctx.log('Performing ytauth authentication');

    try {
        const headerValue =
            config.ytauthHeaderName === 'Authorization' ? `Bearer ${cookie}` : cookie;
        const headers = {
            [config.ytauthHeaderName]: headerValue,
        };
        const res = await axios.get(`${config.ytauthUrl}/tokens/authenticate`, {headers});

        if (res.status === 200) {
            const userInfo = parseUserInfo(res.data);
            if (!userInfo) {
                ctx.log(`Unable to parse user info from ytauth response! Response: ${res.data}`);
                throw new UnexpectedError('Unable to parse user info', res.status, res.data);
            }
            ctx.log('Successful ytauth authentication!');
            return userInfo;
        }

        ctx.log(`Unexpected ytauth status code! Code: ${res.status}, response: ${res.data}`);
        throw new UnexpectedError('Unexpected ytauth status code', res.status, res.data);
    } catch (e) {
        if (e instanceof YtauthError) {
            throw e;
        } else if (axios.isAxiosError(e) && e.response?.status === 403) {
            ctx.log(`Unsuccessful ytauth authentication! Response: ${e.response?.data}`);
            throw new BadTokenError(e.response?.status, e.response?.data);
        } else {
            ctx.log(`Unsuccessful ytauth authentication! Error: ${e}`);
            throw new UnexpectedError(undefined, undefined, undefined, e as Error);
        }
    }
}

export async function getOauthConfig(config: YtauthConfig): Promise<OauthConfig> {
    try {
        const res = await axios.get(`${config.ytauthUrl}/oauth`);
        if (res.status === 200) {
            const oauthConfig = parseOauthConfig(res.data);
            if (!oauthConfig) {
                throw new UnexpectedError(`Unable to parse oauth config`, res.status, res.data);
            }
            return oauthConfig;
        }
        throw new UnexpectedError(
            `Unexpected status code while getting oauth config`,
            res.status,
            res.data,
        );
    } catch (e) {
        if (e instanceof YtauthError) {
            throw e;
        } else if (axios.isAxiosError(e)) {
            throw new UnexpectedError(
                'Unexpected axios error',
                e.response?.status,
                e.response?.data,
                e as Error,
            );
        }
        throw new UnexpectedError(
            `Unexpected error while getting oauth config`,
            undefined,
            undefined,
            e as Error,
        );
    }
}

export async function handleOauthConfig(req: Request, res: Response) {
    const config = req.ctx.config.ytauthConfig;

    if (!config) {
        sendResponse(res, {enabled: false});
        return;
    }

    try {
        const oauthConfig = await getOauthConfig(config);
        sendResponse(res, {enabled: true, ...oauthConfig});
    } catch (e) {
        sendError(res, e);
    }
}

export async function handleOauthCallback(req: Request, res: Response) {
    const config = req.ctx.config.ytauthConfig;

    if (!config) {
        sendError(
            res,
            new UnexpectedError('Oauth is not configured, add ytauthConfig to AppConfig'),
            500,
        );
        return;
    }

    const code = req.query['code'];
    if (!code) {
        sendError(res, new UnexpectedError("Oauth callback without query parameter 'code'"), 500);
        return;
    }

    try {
        const tokenRes = await axios.post(`${config.ytauthUrl}/oauth/authorize`, {
            auth_code: code,
            redirect_uri: `${req.secure ? 'https://' : 'http://'}${req.get(
                'host',
            )}/api/oauth/callback`,
        });

        if (tokenRes.status !== 200) {
            throw new UnexpectedError(
                'Not 200 response from ytauth authorize',
                tokenRes.status,
                tokenRes.data,
            );
        }

        if (!tokenRes.data?.token) {
            throw new UnexpectedError(
                'Token is not presented in response of ytauth authorize',
                tokenRes.status,
                tokenRes.data,
            );
        }

        res.cookie(config.ytauthCookieName, tokenRes.data.token);
        res.redirect('/');
    } catch (e) {
        if (e instanceof YtauthError) {
            throw e;
        } else if (axios.isAxiosError(e)) {
            throw new UnexpectedError(
                'Axios request to ytauth authorize failed',
                e.response?.status,
                e.response?.data,
                e as Error,
            );
        } else {
            throw new UnexpectedError(
                'Unexpected error while ytauth authorize',
                undefined,
                undefined,
                e as Error,
            );
        }
    }
}
