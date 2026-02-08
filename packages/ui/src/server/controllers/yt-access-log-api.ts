import axios from 'axios';
import isEmpty_ from 'lodash/isEmpty';
import qs from 'qs';
import type {Request, Response} from '../../@types/core';
import ServerFactory from '../ServerFactory';
import {
    ErrorWithCode,
    UNEXPECTED_PIPE_AXIOS_RESPONSE,
    pipeAxiosResponse,
    sendAndLogError,
} from '../utils';
import {getBaseUrlFromConfiguration} from '../utils/config-utils';

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

export async function ytAccesLogCheckAvailable(req: Request, res: Response) {
    try {
        const {baseUrl} = await getAccessLogBaseUrl(req);
        res.send({is_access_log_available: Boolean(baseUrl)});
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

function getAccessLogBaseUrl(req: Request) {
    const {ytAuthCluster: cluster} = req.params;
    const isDeveloper = req.cookies.ui_config_mode === 'developer';

    return getBaseUrlFromConfiguration(req, {
        cluster,
        isDeveloper,
        uiConfigFieldName: 'access_log_base_url',
        uiSettingsFieldName: 'accessLogBasePath',
    });
}

const ALLOWED_ACTIONS = new Set(['ready', 'visible-time-range', 'access_log', 'qt_access_log']);

async function ytAccessLogApiImpl(req: Request, res: Response) {
    const {action} = req.params;

    if (!ALLOWED_ACTIONS.has(action)) {
        throw new ErrorWithCode(404, 'Unexpected action for Navigation/Access log');
    }

    const {baseUrl, testing} = await getAccessLogBaseUrl(req);

    if (!baseUrl) {
        throw new ErrorWithCode(
            404,
            'The UI installation is not configured to display "Navigation/Access log" tab on current cluster. Please check your configuration: config.uiSettings.accessLogBasePath, //sys/@ui_config/access_log_base_url',
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
