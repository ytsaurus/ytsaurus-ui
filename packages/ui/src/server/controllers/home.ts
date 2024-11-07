import type {Request, Response} from 'express';
import isEmpty_ from 'lodash/isEmpty';

import {getLayoutConfig} from '../components/layout-config';
import {create, get, getSettingsConfig, isRemoteSettingsConfigured} from '../components/settings';
import {getClusterConfig} from '../components/utils';
import ServerFactory from '../ServerFactory';
import {isLocalModeByEnvironment} from '../utils';
import {getDefaultUserSettings} from '../utils/default-settings';
import {isRootPage} from '../utils/is-root-page';

export function homeIndexFactory(entryName = 'main') {
    return async (req: Request, res: Response) => {
        const isRoot = isRootPage(req, req.params.ytAuthCluster);
        const cluster = isRoot ? undefined : req.params.ytAuthCluster;

        try {
            const url = await ServerFactory.getHomeRedirectedUrl(cluster, req);
            if (url) {
                return res.redirect(url);
            }
        } catch (e) {
            req.ctx.logError('Failed to calculate redirects', e);
        }

        const {ctx} = req;

        const {clusterConfig, ytConfig} = getClusterConfig(cluster);
        const login = ytConfig.isLocalCluster ? 'root' : req.yt?.login;
        // Refuse to serve localRemoteProxy requests erroneously delegated from main interface to another
        // interface running in a container (instead of YT container)
        if (isEmpty_(clusterConfig) && cluster) {
            if (!req.ctx.config.ytAllowRemoteLocalProxy && !isLocalModeByEnvironment()) {
                res.redirect('/');
                return;
            }
            res.status(404).send(
                `No config for cluster <b>${encodeURIComponent(cluster)}</b> exists.` +
                    '<div>If you are trying to connect to your local cluster please make sure:</div>' +
                    '<ol><li>FQDN of the cluster is correct</li>' +
                    '<li>The port is greater than or equal to 1000.</li></ol>',
            );
            return;
        }

        const useRemoteSettings = isRemoteSettingsConfigured();

        const settings = {
            data: getDefaultUserSettings(req.ctx.config),
            meta: {
                useRemoteSettings,
                errorMessage: undefined as string | undefined,
            },
        };

        const settingsConfig = getSettingsConfig(cluster!);

        if (login && useRemoteSettings && settingsConfig.cluster) {
            try {
                await create({ctx, username: login, cluster: settingsConfig.cluster});
                const userSettings = login
                    ? await get({ctx, username: login, cluster: settingsConfig.cluster})
                    : {};
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
            name: entryName,
            login,
            uid: req.yt?.uid,
            cluster,
            ytConfig,
            settings,
        });
        const html = await ServerFactory.renderLayout(layoutConfig, req, res);
        res.send(html);
    };
}
