import {AppConfig, AppContext} from '@gravity-ui/nodekit';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import {AppConfig, Request, Response} from '@gravity-ui/expresskit';
import {MetrikaCounter} from '@gravity-ui/app-layout';
import type {NodeKit} from '@gravity-ui/nodekit';

import {ClusterConfig} from '../shared/yt-types';

import {UISettings} from '../../shared/ui-settings';
import {DescribedSettings} from '../shared/constants/settings-types';

export interface YTCoreConfig {
    /**
     * Enables YT-password authentication when defined
     */
    allowPasswordAuth: boolean;

    /**
     *  Path to the file with OAuth-token of special-user ("the OAuthRobot" below) in format: {"oauthToken": "******"}
     *  The OAuth-token is used for some service requests, see usages of getRobotYTApiSetup.
     */
    ytInterfaceSecret: string;
    /**
     * Path to json-file with cluster configs in format:
     * {clusters: Array<ClusterConfig>}
     */
    clustersConfigPath: string;

    /**
     * Enable direct requests to YT-api requests for all requests.
     * If disabled then only some heavy requests like write_table, read_table(for Download) are sent directly.
     */
    ytApiUseCORS: boolean;

    /**
     * Allows to connect to local-clusters
     */
    ytAllowRemoteLocalProxy?: boolean;

    /**
     * All option from this object might be accesed throgh `window.__DATA__.uiSettings`
     */
    uiSettings: UISettings;

    /**
     * Settings of Metrika counter
     */
    metrikaCounter: Array<MetrikaCounter>;

    /**
     * Odin is a service for monitoring the availability of YTsaurus clusters
     * This parameter sets service base url and enables UI page
     */
    odinBaseUrl?: Record<string, string> | string;

    /**
     * If defined enables monitoring dashboards described by
     * https://github.com/ytsaurus/ytsaurus/tree/main/yt/admin/dashboards
     * might be provided by process.env.PROMETHEUS_BASE_URL
     */
    prometheusBaseUrl?: string;

    /**
     *  The OAuthRobot should have read/write access to mapNodePath
     */
    userSettingsConfig?: {
        cluster?: string;
        // path to a map node with user-settings files
        mapNodePath: string;
    };

    /**
     * The settings of table to save users' column presets.
     * If you want to have ability to share table links with column presets
     * you have to create the dynamic table manually with 2 columns: ["hash", "columns_json"],
     * "hash" column should be defined as an ordered column (key column).
     * The OAuthRobot should have read/write access to the table.
     */
    userColumnPresets?: {
        cluster?: string;
        dynamicTablePath: string;
    };

    /**
     * OpenID Connect configuration
     */
    ytOAuthSettings?: {
        /**
         * URL of the OpenID connect server without the trailing slash
         */
        baseURL: string;
        /**
         *  Authorization endpoint
         */
        authPath: string;
        /**
         *  Authorization endpoint
         */
        logoutPath: string;
        /**
         *  Authorization endpoint
         */
        tokenPath: string;
        /**
         *  OpenID Client id
         */
        clientId: string;
        /**
         *  OpenID Client secret
         */
        clientSecret: string;
        /**
         *  OpenID Scope(Details https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes)
         */
        scope: string;
        /**
         *  Label on the Login via OpenID button
         */
        buttonLabel?: string;
        /**
         * Represents the URL to which request will be redirected.
         */
        callbackBaseUrl?: string;
    };
    /**
     * Modifies headers of /api/yt/login request:
     * if enabled removes 'Secure'-option from 'Set-Cookie: YTCypressCookie=...; ...' response-header
     */
    ytAuthAllowInsecure?: boolean;

    /**
     * Allows to override defaultUserSettings
     */
    defaultUserSettingsOverrides?: Partial<DescribedSettings>;

    /**
     * The field is applicabale only for local-clusters, do not use it for clusters from clusters-config.json.
     */
    localmodeClusterConfig?: Partial<Pick<ClusterConfig, 'urls' | 'externalProxy'>>;

    /**
     * Base url to TabletErrorsManager service
     */
    tabletErrorsBaseUrl?: string;

    adjustAppConfig?: (nodekit: NodeKit) => void;
}

declare module '@gravity-ui/nodekit' {
    interface AppConfig extends YTCoreConfig {}

    interface AppContextParams {
        requestId?: string;
        userId?: string;
    }
}

declare module '@gravity-ui/expresskit' {
    interface AppRouteParams {
        ui?: true;
        ignoreRedirect?: boolean;
    }
}

declare global {
    namespace Express {
        interface Request {
            yt: {
                uid?: string;
                login?: string;
                ytApiAuthHeaders?: Record<string, string>;
                tabletErrorApiAuthHeaders?: Record<string, string>;
                tabletErrorTestingApiAuthHeaders?: Record<string, string>;
            };
        }
    }
}

declare module 'express' {
    interface Request {
        yt: {
            uid?: string;
            login?: string;
            ytApiAuthHeaders?: Record<string, string>;
            tabletErrorApiAuthHeaders?: Record<string, string>;
            tabletErrorTestingApiAuthHeaders?: Record<string, string>;
        };
        ctx: AppContext;
    }
}

export {AppConfig, Request, Response};
