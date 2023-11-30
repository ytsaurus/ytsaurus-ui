import type {Request, Response} from 'express';
import axios from 'axios';
import _ from 'lodash';
import {YT_CYPRESS_COOKIE_NAME} from '../../shared/constants';
import {getUserYTApiSetup, getYTApiClusterSetup} from '../components/requestsSetup';
import {UNEXPECTED_PIPE_AXIOS_RESPONSE, pipeAxiosResponse, sendAndLogError} from '../utils';
import crypto from 'crypto';

// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';
import {getXSRFToken} from '../components/cluster-queries';
import {getAuthCluster} from '../components/yt-auth';

const yt = ytLib();

export async function handleLogin(req: Request, res: Response) {
    try {
        const ytAuthCluster = getAuthCluster(req.ctx.config);

        const {username, password} = JSON.parse(req.body) || {};
        if (!username || !password) {
            throw new Error('Username and password must not be empty');
        }

        const {proxyBaseUrl} = getYTApiClusterSetup(ytAuthCluster);
        const requestUrl = `${proxyBaseUrl}/login`;

        const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

        await axios
            .request({
                url: requestUrl,
                method: req.method as any,
                headers: {...req.ctx.getMetadata(), Authorization: `Basic ${basicAuth}`},
                timeout: 10000,
                responseType: 'stream',
            })
            .then(async (response) => {
                const pipedSize = await pipeAxiosResponse(
                    req.ctx,
                    res,
                    response,
                    undefined,
                    (headers) => removeSecureFlagIfOriginInsecure(req, headers),
                );
                if (!pipedSize) {
                    throw new Error(UNEXPECTED_PIPE_AXIOS_RESPONSE);
                }
            });
    } catch (e: any) {
        sendAndLogError(req.ctx, res, 500, e);
    }
}

function removeSecureFlagIfOriginInsecure(
    req: Request,
    headers: Record<string, string | Array<string>>,
) {
    const {ytAuthAllowInsecure} = req.ctx.config;
    const {origin} = req.headers;

    if (!ytAuthAllowInsecure || 'string' !== typeof origin || !origin.startsWith('http://')) {
        return headers;
    }

    return _.reduce(
        headers,
        (acc, v, k) => {
            if (k !== 'set-cookie') {
                acc[k] = v;
            } else {
                const tmp = _.map(v as Array<string>, (item) => {
                    if (item.startsWith(YT_CYPRESS_COOKIE_NAME)) {
                        return item.replace(/\s*Secure;/, '');
                    }
                    return item;
                });
                acc[k] = tmp;
            }
            return acc;
        },
        {} as typeof headers,
    );
}

export async function handleChangePassword(req: Request, res: Response) {
    try {
        const ytAuthCluster = getAuthCluster(req.ctx.config);

        const {newPassword, currentPassword} = JSON.parse(req.body) || {};
        if (!newPassword || !currentPassword) {
            throw new Error('New and current password must not be empty');
        }

        const new_password_sha256 = crypto.createHash('sha256').update(newPassword).digest('hex');
        const current_password_sha256 = crypto
            .createHash('sha256')
            .update(currentPassword)
            .digest('hex');

        let cfg;
        try {
            cfg = getUserYTApiSetup(ytAuthCluster, req);
        } catch (e: any) {
            sendAndLogError(req.ctx, res, 400, e);
            return;
        }

        const {setup} = cfg;
        const {login, csrf_token} = await getXSRFToken(req, cfg);

        yt.setup.createOption('requestHeaders', 'object', {
            'X-Csrf-Token': csrf_token,
        });

        await yt.v4
            .setUserPassword({
                setup,
                parameters: {user: login, new_password_sha256, current_password_sha256},
            })
            .then((result: unknown) => {
                res.status(200).send({result});
            })
            .catch((err: any) => {
                sendAndLogError(req.ctx, res, 500, err);
            });
    } catch (e: any) {
        sendAndLogError(req.ctx, res, 500, e);
    }
}
