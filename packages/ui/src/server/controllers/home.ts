import type {Request, Response} from 'express';
import _ from 'lodash';

import {getLayoutConfig} from '../components/layout-config';
import {create, get, isRemoteSettingsConfigured} from '../components/settings';
import {getClusterConfig} from '../components/utils';
import ServerFactory, {getApp} from '../ServerFactory';
import {isLocalModeByEnvironment} from '../utils';
import {getDafaultUserSettings} from '../utils/default-settings';
import {ODIN_PAGE_ID} from '../../shared/constants';

function isRootPage(page: string) {
    const rootPages = [
        ...(getApp().config?.odinBaseUrl ? [ODIN_PAGE_ID] : []),
        ...ServerFactory.getExtraRootPages(),
    ];
    return -1 !== rootPages.indexOf(page);
}

export function homeRedirect(req: Request, res: Response) {
    const cluster = req.params.cluster;
    const {referrer} = req.query;
    const url = referrer ? (referrer as string) : `/${cluster}`;

    res.redirect(url);
}

export async function homeIndex(req: Request, res: Response) {
    const isRoot = isRootPage(req.params.cluster);
    const cluster = isRoot ? undefined : req.params.cluster;

    try {
        const url = await ServerFactory.getHomeRedirectedUrl(cluster, req);
        if (url) {
            return res.redirect(url);
        }
    } catch (e) {
        req.ctx.logError('Failed to calculate redirects', e);
    }

    const {ctx} = req;

    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    const {clusterConfig, ytConfig} = getClusterConfig(cluster);
    const login = ytConfig.isLocalCluster ? 'root' : req.yt?.login;
    // Refuse to serve localRemoteProxy requests erroneously delegated from main interface to another
    // interface running in a container (instead of YT container)
    if (_.isEmpty(clusterConfig) && cluster) {
        if (!req.ctx.config.ytAllowRemoteLocalProxy && !isLocalModeByEnvironment()) {
            res.redirect('/');
            return;
        }
        res.status(404).send(
            `No config for cluster '${cluster}' exists.` +
                '<div>If you are trying to connect to your local cluster please make sure:</div>' +
                '<ol><li>FQDN of the cluster is correct</li>' +
                '<li>The port is greater than or equal to 1000.</li></ol>',
        );
        return;
    }

    const useRemoteSettings = isRemoteSettingsConfigured();

    const settings = {
        data: getDafaultUserSettings(req.ctx.config),
        meta: {
            useRemoteSettings,
            errorMessage: undefined as string | undefined,
        },
    };

    if (login && useRemoteSettings) {
        try {
            await create({ctx, username: login});
            const userSettings = login ? await get({ctx, username: login}) : {};
            settings.data = {...settings.data, ...userSettings};
        } catch (e) {
            const message = `Error in getting user settings for ${login}`;
            req.ctx.logError(message, e);

            const errorMessage =
                `Oh, no. ${message}. You are using default settings. ` +
                'All settings changes will be saved in browser only.\n' +
                'Try to reload page. If problem persists please report it via Bug Reporter.';

            settings.meta = {
                ...settings.meta,
                useRemoteSettings: false,
                errorMessage,
            };
        }
    }

    const layoutConfig = await getLayoutConfig(req, {
        login,
        uid: req.yt?.uid,
        cluster,
        ytConfig,
        settings,
    });
    const html = await ServerFactory.renderLayout(layoutConfig, req, res);
    res.send(html);
}
