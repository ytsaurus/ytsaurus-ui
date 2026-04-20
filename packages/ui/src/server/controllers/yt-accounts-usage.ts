import axios from 'axios';
import isEmpty_ from 'lodash/isEmpty';
import qs from 'qs';
import {type Request, type Response} from '../../@types/core';
import ServerFactory from '../ServerFactory';
import {
    ErrorWithCode,
    UNEXPECTED_PIPE_AXIOS_RESPONSE,
    pipeAxiosResponse,
    sendAndLogError,
} from '../utils';
import {getBaseUrlFromConfiguration} from '../utils/config-utils';

export async function ytAccountsUsageApi(req: Request, res: Response) {
    try {
        await ytAccountsUsageApiImpl(req, res);
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

export async function ytAccountsUsageCheckAvailable(req: Request, res: Response) {
    try {
        const {baseUrl} = await getAccountsUsageBaseUrl(req);
        res.send({is_accounts_usage_available: Boolean(baseUrl)});
    } catch (e: any) {
        await sendAndLogError(req.ctx, res, 500, e, {
            method: 'nodejs',
            query: req.query,
            page: req.headers.referer,
        });
    }
}

function getAccountsUsageBaseUrl(req: Request) {
    const {ytAuthCluster: cluster} = req.params;
    const isDeveloper = req.cookies.ui_config_mode === 'developer';

    return getBaseUrlFromConfiguration(req, {
        cluster,
        isDeveloper,
        uiSettingsFieldName: 'accountsUsageBasePath',
    });
}

const ALLOWED_ACTIONS = new Set([
    'list-timestamps',
    'get-resource-usage',
    'get-children-and-resource-usage',
    'get-versioned-resource-usage',
    'get-resource-usage-diff',
    'get-children-and-resource-usage-diff',
]);

async function ytAccountsUsageApiImpl(req: Request, res: Response) {
    const {action} = req.params;

    if (!ALLOWED_ACTIONS.has(action)) {
        throw new ErrorWithCode(404, 'Unexpected action for Accounts usage');
    }

    const {baseUrl, testing} = await getAccountsUsageBaseUrl(req);

    if (!baseUrl) {
        throw new ErrorWithCode(
            404,
            'The UI installation is not configured to display "Accounts/Detailed usage" tab for current cluster. Please check your configuration: config.uiSettings.accountsUsageBasePath, //sys/@ui_config/resource_usage_base_url',
        );
    }

    const authType = testing ? 'accountsUsageTest' : 'accountsUsageProd';
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
