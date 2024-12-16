import type {Request, Response} from 'express';
import {
    exchangeOAuthToken,
    getOAuthLoginPath,
    removeOAuthCookies,
    saveOAuthTokensInCookies,
} from '../components/oauth';

export function oauthLogin(req: Request, res: Response) {
    res.redirect(getOAuthLoginPath(req, res));
}

export function oauthLogout(_: Request, res: Response) {
    removeOAuthCookies(res);
    res.redirect('/');
}

export async function oauthCallback(req: Request, res: Response) {
    const {code, state} = req.query;
    if (!code) {
        throw new Error('Authorization code is not specified');
    }

    let redirectURL = '/';

    if (state) {
        redirectURL = req.cookies[state as string]?.retPath ?? '/';
    }

    try {
        const tokens = await exchangeOAuthToken(req, code as string);

        saveOAuthTokensInCookies(res, tokens);

        res.redirect(redirectURL);
    } catch (e) {
        req.ctx.logError('exchange token error', e);
        const message = e instanceof Error ? e.message : 'Unknown error';
        res.status(500).send(message);
    }
}
