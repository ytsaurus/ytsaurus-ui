import _ from 'lodash';
import {getInterfaceVersion, isProductionEnv} from '../utils';
import type {Request} from 'express';
import {YTCoreConfig} from '../../@types/core';
import {ConfigData, YTConfig} from '../../shared/yt-types';
import {AppLayoutConfig} from '../render-layout';
import {isUserColumnPresetsEnabled} from '../controllers/table-column-preset';

interface Params {
    login?: string;
    uid?: string;
    cluster: string | undefined;
    settings: ConfigData['settings'];
    ytConfig: Partial<YTConfig>;
}

export async function getLayoutConfig(req: Request, params: Params): Promise<AppLayoutConfig> {
    const {login, ytConfig, settings} = params;
    const {ytApiUseCORS, uiSettings, metrikaCounter, ytAuthCluster, odinBaseUrl, chytApiBaseUrl} =
        req.ctx.config as YTCoreConfig;
    const YT = ytConfig;
    const uiVersion = getInterfaceVersion();

    const parameters = {
        interface: {
            version: uiVersion,
        },
        login,
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
            allowUserColumnPresets: isUserColumnPresetsEnabled(req),
            odinPageEnabled: Boolean(odinBaseUrl),
            chytPageEnabled: Boolean(chytApiBaseUrl),
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
