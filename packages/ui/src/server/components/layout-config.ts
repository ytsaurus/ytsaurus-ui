import type {Request} from 'express';
import {YTCoreConfig} from '../../@types/core';
import {ConfigData, YTConfig} from '../../shared/yt-types';
import {AppLayoutConfig} from '../render-layout';
import {isUserColumnPresetsEnabled} from '../controllers/table-column-preset';
import {getInterfaceVersion, isProductionEnv} from '../utils';
import {getAuthWay} from '../utils/authorization';
import {getOAuthSettings, isOAuthAllowed} from './oauth';

interface Params {
    login?: string;
    uid?: string;
    cluster: string | undefined;
    settings: ConfigData['settings'];
    ytConfig: Partial<YTConfig>;
}

export async function getLayoutConfig(req: Request, params: Params): Promise<AppLayoutConfig> {
    const {login, ytConfig, settings} = params;
    const {ytApiUseCORS, uiSettings, metrikaCounter, ytAuthCluster, odinBaseUrl} = req.ctx
        .config as YTCoreConfig;
    const YT = ytConfig;
    const uiVersion = getInterfaceVersion();

    const parameters = {
        interface: {
            version: uiVersion,
        },
        login,
        authWay: getAuthWay(req),
    };

    const isProduction = isProductionEnv();

    const res: AppLayoutConfig = {
        bodyContent: {root: ''},
        title: 'YT',
        lang: 'en',
        meta: [
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0',
            },
        ],
        inlineScripts: [
            `window.YT = Object.assign(window.YT || {}, ${JSON.stringify(YT)}, ${JSON.stringify({
                parameters,
            })});`,
            `window.YT.environment = window.YT.environment || (${isProduction} ? 'production' : 'development');`,
        ],
        data: {
            settings,
            ytApiUseCORS,
            uiSettings,
            metrikaCounterId: metrikaCounter?.[0]?.id,
            allowLoginDialog: Boolean(ytAuthCluster),
            allowOAuth: isOAuthAllowed(req),
            oauthButtonLabel: isOAuthAllowed(req) ? getOAuthSettings(req).buttonLabel : undefined,
            allowUserColumnPresets: isUserColumnPresetsEnabled(req),
            odinPageEnabled: Boolean(odinBaseUrl),
        },
        pluginsOptions: {
            yandexMetrika: {
                counter: metrikaCounter,
            },
            layout: {
                name: 'main',
            },
        },
    };
    return res;
}
