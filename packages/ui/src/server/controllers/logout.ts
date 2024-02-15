import type {Request, Response} from 'express';
import {getOAuthLogoutPath, isOAuthAllowed, isUserOAuthLogged} from '../components/oauth';
import {YTAuthLogout, isYtAuthEnabled} from '../components/yt-auth';

export function handleLogout(req: Request, res: Response) {
    if (isOAuthAllowed(req) && isUserOAuthLogged(req)) {
        res.redirect(getOAuthLogoutPath(req));
    } else if (isYtAuthEnabled(req.ctx.config)) {
        YTAuthLogout(res);
    }
    res.redirect('/');
}
