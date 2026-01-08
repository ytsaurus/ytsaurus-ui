import type {Request} from 'express';
import {YTCoreConfig} from '../../@types/core';
import {ConfigData, YTConfig} from '../../shared/yt-types';
import {AppLayoutConfig} from '../render-layout';
import {isUserColumnPresetsEnabled} from '../controllers/table-column-preset';
import {getInterfaceVersion, isProductionEnv} from '../utils';
import {getAuthWay} from '../utils/authorization';
import {getOAuthSettings, isOAuthAllowed} from './oauth';

interface Params {
    name?: string;
    login?: string;
    uid?: string;
    cluster: string | undefined;
    settings: ConfigData['settings'];
    ytConfig: Partial<YTConfig>;
}

export async function getLayoutConfig(req: Request, params: Params): Promise<AppLayoutConfig> {
    const {name = 'main', login, ytConfig, settings} = params;
    const {
        ytApiUseCORS,
        uiSettings,
        metrikaCounter,
        allowPasswordAuth,
        odinBaseUrl,
        prometheusBaseUrl,
        userSettingsConfig,
        tabletErrorsBaseUrl,
    } = req.ctx.config as YTCoreConfig;
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
    const selectedFontType = settings.data['global::fontType'];
    const {defaultFontType} = uiSettings;

    const res: AppLayoutConfig = {
        bodyContent: {root: '', className: `app-font-${selectedFontType || defaultFontType || ''}`},
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
            userSettingsCluster: userSettingsConfig?.cluster,
            settings,
            ytApiUseCORS,
            uiSettings,
            metrikaCounterId: metrikaCounter?.[0]?.id,
            allowPasswordAuth: Boolean(allowPasswordAuth),
            allowOAuth: isOAuthAllowed(req),
            oauthButtonLabel: isOAuthAllowed(req) ? getOAuthSettings(req).buttonLabel : undefined,
            allowUserColumnPresets: isUserColumnPresetsEnabled(req),
            odinPageEnabled: Boolean(odinBaseUrl),
            allowTabletErrorsAPI: Boolean(tabletErrorsBaseUrl),
            allowPrometheusDashboards: Boolean(prometheusBaseUrl),
        },
        pluginsOptions: {
            yandexMetrika: {
                counter: metrikaCounter,
            },
            layout: {
                name,
            },
        },
    };
    return res;
}
