import type {Request, Response} from 'express';
import type {ExpressKit} from '@gravity-ui/expresskit';
import forEach_ from 'lodash/forEach';
import {YT_LOCAL_CLUSTER_ID} from './constants';
import {ConfigData} from '../shared/yt-types';
import renderLayout, {AppLayoutConfig} from './render-layout';
import {isLocalModeByEnvironment} from './utils';
import {VcsApi} from '../shared/vcs';
import {CustomVCSType, VCSSettings} from '../shared/ui-settings';

export interface ServerFactory {
    getExtraRootPages(): Array<string>;
    isLocalClusterId(cluster: string): boolean;
    getHomeRedirectedUrl(cluster: string | undefined, req: Request): Promise<string | undefined>;
    renderLayout(params: AppLayoutConfig, req: Request, res: Response): Promise<string>;
    createCustomVcsApi(
        type: CustomVCSType,
        vcs: Omit<VCSSettings, 'type'>,
        token?: string,
    ): VcsApi | undefined;
    getAuthHeaders(
        type: 'aiChat' | 'accessLogProd' | 'accessLogTest',
        req: Request,
    ): Record<string, string | undefined> | undefined;
}

let app: ExpressKit;

export function rememberApp(v: ExpressKit) {
    if (app) {
        throw new Error('The method must not be called more than once');
    }
    app = v;
}

/**
 * @deprecated use req.ctx.config instead of App().config
 */
export function getApp() {
    return app!;
}

const serverFactory: ServerFactory = {
    getExtraRootPages() {
        return [];
    },
    isLocalClusterId(cluster) {
        return isLocalModeByEnvironment() || cluster === YT_LOCAL_CLUSTER_ID;
    },
    getHomeRedirectedUrl() {
        return Promise.resolve(undefined);
    },
    async renderLayout(params) {
        return await renderLayout<ConfigData>(params);
    },
    createCustomVcsApi() {
        return undefined;
    },
    getAuthHeaders(type, req) {
        if (type === 'accessLogProd' || type === 'accessLogTest') {
            return req.yt.ytApiAuthHeaders;
        }
        return undefined;
    },
};

function configureServerFactoryItem<K extends keyof ServerFactory>(
    k: K,
    redefinition: ServerFactory[K],
) {
    serverFactory[k] = redefinition;
}

export function configureServerFactory(overrides: Partial<ServerFactory>) {
    forEach_(overrides, (_v, k) => {
        const key = k as keyof ServerFactory;
        configureServerFactoryItem(key, overrides[key]!);
    });
}

export default new Proxy(serverFactory, {
    set: () => {
        throw new Error('Use configureUIFactory(...) method instead of direct modifications');
    },
});
