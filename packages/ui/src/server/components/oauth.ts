import axios from 'axios';
import type {Request, Response} from 'express';
import {YT_OAUTH_ACCESS_TOKEN_NAME, YT_OAUTH_REFRESH_TOKEN_NAME} from '../../shared/constants';

export function isOAuthAllowed(req: Request) {
    const config = req.ctx.config.ytOAuthSettings;
    return Boolean(
        config &&
            config.baseURL &&
            config.authPath &&
            config.tokenPath &&
            config.clientId &&
            config.clientSecret,
    );
}

export function getOAuthSettings(req: Request) {
    const config = req.ctx.config.ytOAuthSettings;
    if (!config) {
        throw new Error('OAuth settings is not specified');
    }
    return config;
}

// See https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.3.3
export type OAuthAuthorizationTokens = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
};

export function isUserOAuthLogged(req: Request) {
    return (
        Boolean(req.cookies[YT_OAUTH_ACCESS_TOKEN_NAME]) ||
        Boolean(req.cookies[YT_OAUTH_REFRESH_TOKEN_NAME])
    );
}

export async function getOAuthAccessToken(req: Request, res: Response) {
    if (req.cookies[YT_OAUTH_ACCESS_TOKEN_NAME]) {
        return req.cookies[YT_OAUTH_ACCESS_TOKEN_NAME];
    } else if (req.cookies[YT_OAUTH_REFRESH_TOKEN_NAME]) {
        const tokens = await refreshOAuthToken(
            req,
            req.cookies[YT_OAUTH_REFRESH_TOKEN_NAME] as string,
        );
        saveOAuthTokensInCookies(res, tokens);
        return tokens.access_token;
    }
    return undefined;
}

export function removeOAuthCookies(res: Response) {
    res.clearCookie(YT_OAUTH_ACCESS_TOKEN_NAME);
    res.clearCookie(YT_OAUTH_REFRESH_TOKEN_NAME);
}

export function saveOAuthTokensInCookies(res: Response, tokens: OAuthAuthorizationTokens) {
    res.cookie(YT_OAUTH_ACCESS_TOKEN_NAME, tokens.access_token, {
        maxAge: tokens.expires_in * 1000,
        httpOnly: true,
        secure: true,
    });

    if (tokens.refresh_token) {
        res.cookie(YT_OAUTH_REFRESH_TOKEN_NAME, tokens.refresh_token, {
            maxAge: tokens.refresh_expires_in,
            httpOnly: true,
            secure: true,
        });
    }
}

export function getOAuthLoginPath(req: Request) {
    const config = getOAuthSettings(req);
    const host = req.get('host');
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        scope: config.scope,
        redirect_uri: `https://${host}/api/oauth/callback`,
    });

    const url = new URL(config.authPath, config.baseURL);
    url.search = params.toString();

    return url.toString();
}

export function getOAuthLogoutPath(req: Request) {
    const config = getOAuthSettings(req);
    const host = req.get('host');
    const params = new URLSearchParams({
        post_logout_redirect_uri: `https://${host}/api/oauth/logout/callback`,
        client_id: config.clientId,
    });

    const url = new URL(config.logoutPath, config.baseURL);
    url.search = params.toString();

    return url.toString();
}

export async function refreshOAuthToken(
    req: Request,
    token: string,
): Promise<OAuthAuthorizationTokens> {
    const config = getOAuthSettings(req);
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config?.clientId,
        refresh_token: token,
        client_secret: config?.clientSecret,
    });
    const {data} = await axios.post(
        new URL(config.tokenPath, config.baseURL).toString(),
        params.toString(),
        {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
        },
    );
    return data;
}

export async function exchangeOAuthToken(
    req: Request,
    code: string,
): Promise<OAuthAuthorizationTokens> {
    const config = getOAuthSettings(req);
    const host = req.get('host');
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code: code as string,
        client_secret: config.clientSecret,
        redirect_uri: `https://${host}/api/oauth/callback`,
    });

    const {data} = await axios.post(
        new URL(config.tokenPath, config.baseURL).toString(),
        params.toString(),
        {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
        },
    );
    return data;
}
