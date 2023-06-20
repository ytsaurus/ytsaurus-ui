import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import {MetaTableItem} from './components/MetaTable/MetaTable';
import _ from 'lodash';
import React from 'react';
import {Reducer} from 'redux';
import {PathParameters} from './store/location';
import {ClusterUiConfig} from './store/reducers/global/cluster-ui-config';
import {TabletBundle} from './store/reducers/tablet_cell_bundles';
import {PoolInfo} from './store/selectors/scheduling/scheduling-pools';
import {ClusterConfig} from '../shared/yt-types';
import {ClusterAppearance} from './appearance';
import AppNavigationComponent, {
    AppNavigationProps,
} from './containers/AppNavigation/AppNavigationComponent';
import {ExternalSchemaDescription} from './pages/navigation/tabs/Schema/ExternalDescription/ExternalDescription';
import {AclApi, defaultAclApi} from './utils/acl/external-acl-api';
import {SubjectsControlProps} from './components/ACL/SubjectsControl/SubjectsControl';
import {SettingsPage} from './containers/SettingsPanel/settings-description';
import {UserSuggestProps} from './containers/UserSuggest/UserSuggest';
import {YTUserSuggest} from './containers/UserSuggest/YTUserSuggest';
import {docsUrls, DocsUrls} from './constants/docsUrls';
import {YTSubjectSuggest} from './components/ACL/SubjectsControl/YTSubjectSuggest';
import RoleActions, {Props as RoleActionsProps} from './components/ACL/RoleActions';
import {PERMISSIONS_SETTINGS} from './constants/acl';

type HeaderItemOrPage =
    | {
          href: string;

          pageId?: undefined;
          reactComponent?: undefined;
          reducers?: undefined;
          urlMapping?: undefined;
      }
    | {
          pageId?: string;
          reactComponent?: React.ComponentType<any>; // used as component for <Route ... component={reactComponent} />
          reducers?: Record<string, Reducer>;
          urlMapping?: Record<string, PathParameters>;

          href?: undefined;
      };

export type UIFactoryRootPageInfo = HeaderItemOrPage & {
    title: string;
    getVisible?: () => Promise<boolean>;
};

export interface UIFactoryClusterPageInfo {
    title: string;
    pageId: string; // also used as urlMatch for <Route path={`/:cluster/${pageId}`} ... />
    svgIcon?: SVGIconData;
    reducers?: Record<string, Reducer>;
    reactComponent: React.ComponentType<any>; // used as component for <Route ... component={reactComponent} />
    topRowComponent?: React.ComponentType<any>; // used as component for <Route ... component={topRowComponent} />
    urlMapping?: Record<string, PathParameters>;
}

export interface ExternalSchemaDescriptionResponse {
    url?: string;
    externalSchema?: Map<string, ExternalSchemaDescription>;
}

export interface ReducersAndUrlMapping {
    reducers?: Record<string, Reducer>;
    urlMapping?: Record<string, PathParameters>;
}

export interface SchedulingExtraTab {
    name: string;
    title?: string;
    component: React.ComponentType<any>;
}

export interface UIFactory {
    getClusterAppearance(cluster?: string): undefined | ClusterAppearance;

    isWatchMen(login: string): boolean;

    makeUrlForExternalUser(login: string): string | undefined;
    makeUrlForTransferTask(operation: unknown): string | undefined;
    makeUrlForNodeIO(cluster: string, host?: string): string | undefined;
    makeUrlForTabletCellBundleDashboard(cluster: string, bundle: string): string | undefined;
    makeUrlForMonitoringDescriptor(
        cluster: string,
        timeRange: {from: string; to?: string},
        monitoring_descriptor?: string,
    ): string | undefined;
    makeUrlForUserDashboard(cluster: string, user: string): string | undefined;

    getExtaClusterPages(): Array<UIFactoryClusterPageInfo>;
    getExtraRootPages(): Array<UIFactoryRootPageInfo>;

    getExtraReducersAndUrlMapping(): undefined | ReducersAndUrlMapping;
    getSchedulingExtraTabs(params: {
        cluster: string;
        pool: string;
        tree: string;
        extraOptions: {
            isRoot?: boolean;
            isEphemeral?: boolean | undefined;
        };
    }): Array<SchedulingExtraTab>;

    getMonitorComponentForAccount():
        | undefined
        | React.ComponentType<{cluster: string; account: string}>;
    getMonitorComponentForBundle():
        | undefined
        | React.ComponentType<{cluster: string; tablet_cell_bundle: string; bundleData: any}>;
    getMonitorComponentForOperation():
        | undefined
        | React.ComponentType<{
              cluster: string;
              operation: {
                  startTime: string;
                  finishTime?: string;
                  pools?: Array<{pool: string; tree: string; slotIndex: number}>;
              };
          }>;
    getMonitorComponentForJob():
        | undefined
        | React.ComponentType<{
              cluster: string;
              job_descriptor: string;
              from?: number;
              to?: number;
          }>;

    getStatisticsComponentForAccount():
        | undefined
        | React.ComponentType<{
              cluster: string;
              account: string;
              accountSubtreeAllNames: Array<string>;
              theme: string;
          }>;

    getStatisticsComponentForBundle():
        | undefined
        | React.ComponentType<{cluster: string; bundle: string; theme: string}>;

    renderNavigationExtraActions(params: {
        className?: string;
        cluster: string;
        path: string;
        type: string;
        attributes: unknown;
    }): React.ReactNode;

    loadClustersAvailability(): Promise<Array<{id: string; availability?: 1}>>;

    renderSchedulingLastDayMaximum(props: {
        className?: string;
        cluster: string;
        tree: string;
        title?: string;
        sensor: 'max_operation_count' | 'max_running_operation_count';
        format?(sensorValue?: number): string;
        current?: {value: string; title: string};
        showHint?: boolean;
        showAsLink?: boolean;
    }): React.ReactNode;

    renderComponentsNodeCardTop(props: {
        className?: string;
        clusterConfig: ClusterConfig;
        host: string;
        physicalHost: string;
    }): React.ReactNode;

    getComponentsNodeDashboardUrl(props: {cluster: string; host: string}): {
        url?: string;
        title?: string;
    };

    renderTransferQuotaNoticeForPool(props: {
        className?: string;
        pool?: PoolInfo;
        parentPool?: PoolInfo;
        clusterUiConfig?: ClusterUiConfig;
        isTopLevel?: boolean;
    }): React.ReactNode;

    renderTransferQuotaNoticeForAccount(props: {
        className?: string;
        isTopLevel?: boolean;
        accountAttributes?: unknown;
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    renderTopRowExtraControlsForAccount(props: {
        className?: string;
        accountAttributes?: unknown;
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    renderTopRowExtraControlsForPool(props: {
        itemClassName?: string;
        pool?: unknown;
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    renderTopRowExtraControlsForBundle(props: {
        itemClassName?: string;
        bundle?: TabletBundle;
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    getExtraMetaTableItemsForComponentsNode(props: {
        clusterConfig: ClusterConfig;
        host: string;
        physicalHost: string;
    }): undefined | Array<MetaTableItem>;

    getExtraMetaTableItemsForPool(props: {
        pool: PoolInfo;
        clusterUiConfig?: ClusterUiConfig;
    }): undefined | Array<MetaTableItem>;

    getExtraMetaTableItemsForBundle(props: {
        bundle: TabletBundle;
        clusterUiConfig: ClusterUiConfig;
    }): undefined | Array<MetaTableItem>;

    renderAccountsTableItemExtraControls(props: {
        itemClassName?: string;
        cluster: string;
        account: string;
        accountAttributes?: unknown;
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    renderSchedulingTableItemExtraControls(props: {
        itemClassName?: string;
        cluster: string;
        pool: unknown;
        clusterUiConfig: ClusterUiConfig;
    }): React.ReactNode;

    renderBundlesTableItemExtraControls(props: {
        itemClassName?: string;
        bundle?: TabletBundle;
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    renderControlAbcService<T extends {slug: string; id?: number}>(props: {
        className?: string;
        value?: T;
        onChange: (v?: T) => void;
        placeholder?: string;
        disabled?: boolean;
    }): React.ReactNode;

    makeSupportContent(
        params: {login: string; cluster?: string; buttonToWrap?: React.ReactNode},
        makeContent: (onSupportClick: () => void) => React.ReactNode,
    ): React.ReactNode;

    getComponentForConsumerMetrics():
        | undefined
        | React.ComponentType<{
              cluster: string;
              path: string;
              targetQueue?: string;
          }>;

    getComonentForQueueMetrics(): undefined | React.ComponentType<{cluster: string; path: string}>;

    renderTableCellBundleEditorNotice(props: {
        bundleData?: {$attributes: unknown};
        clusterUiConfig?: ClusterUiConfig;
    }): React.ReactNode;

    getNodeDeployUrl(ypCluster?: string, podId?: string): string | undefined;
    getNodeNannyUrl(params: {
        pod_id?: string;
        nanny_service?: string;
        yp_cluster?: string;
    }): string | undefined;

    renderAppNavigation(props: AppNavigationProps): React.ReactElement;

    createNotificationUrl(clusterConfig?: ClusterConfig): string | undefined;

    wrapApp(app: React.ReactElement): React.ReactElement;

    externalSchemaDescriptionSetup: {
        caption?: string;
        load(cluster: string, path: string): Promise<ExternalSchemaDescriptionResponse>;
    };

    getAclApi(): AclApi;

    renderAclSubjectsSuggestControl(props: SubjectsControlProps): React.ReactNode;

    renderRolesLink(params: {cluster: string; login: string; className?: string}): React.ReactNode;

    getExternalSettings(params: {
        cluster: string;
        login: string;
        isAdmin: boolean;
    }): Array<SettingsPage>;

    renderUserSuggest(props: UserSuggestProps): React.ReactNode;

    yqlWidgetSetup?: {
        renderButton(props: {className?: string; isSplit?: string}): React.ReactNode;
        renderWidget(props: {cluster: string; path: string; attributes: unknown}): React.ReactNode;
        renderYqlOperationLink(yqlOperationId: string): React.ReactNode;
    };

    getAdminPages(): string[];

    docsUrls: DocsUrls;

    getComponentForAclRoleActions(): undefined | React.ComponentType<RoleActionsProps>;

    getAclPermissionsSettings(): typeof PERMISSIONS_SETTINGS;
}

const adminPages: string[] = [];

const uiFactory: UIFactory = {
    getClusterAppearance() {
        return undefined;
    },
    isWatchMen() {
        return false;
    },
    makeUrlForExternalUser() {
        return undefined;
    },
    makeUrlForTransferTask() {
        return undefined;
    },
    makeUrlForNodeIO() {
        return undefined;
    },
    makeUrlForTabletCellBundleDashboard() {
        return undefined;
    },
    makeUrlForMonitoringDescriptor() {
        return undefined;
    },
    makeUrlForUserDashboard() {
        return undefined;
    },

    getExtaClusterPages() {
        return [];
    },
    getExtraRootPages() {
        return [];
    },

    getExtraReducersAndUrlMapping() {
        return undefined;
    },

    getSchedulingExtraTabs() {
        return [];
    },

    getMonitorComponentForAccount() {
        return undefined;
    },
    getMonitorComponentForBundle() {
        return undefined;
    },
    getMonitorComponentForOperation() {
        return undefined;
    },
    getMonitorComponentForJob() {
        return undefined;
    },
    getStatisticsComponentForAccount() {
        return undefined;
    },
    getStatisticsComponentForBundle() {
        return undefined;
    },

    renderNavigationExtraActions() {
        return null;
    },

    loadClustersAvailability() {
        return Promise.resolve([]);
    },

    renderSchedulingLastDayMaximum() {
        return undefined;
    },

    renderComponentsNodeCardTop() {
        return undefined;
    },

    getExtraMetaTableItemsForComponentsNode() {
        return undefined;
    },

    getExtraMetaTableItemsForPool() {
        return undefined;
    },

    getExtraMetaTableItemsForBundle() {
        return undefined;
    },

    getComponentsNodeDashboardUrl() {
        return {};
    },

    renderTransferQuotaNoticeForPool() {
        return undefined;
    },

    renderTransferQuotaNoticeForAccount() {
        return undefined;
    },

    renderTopRowExtraControlsForAccount() {
        return undefined;
    },

    renderTopRowExtraControlsForPool() {
        return undefined;
    },

    renderTopRowExtraControlsForBundle() {
        return undefined;
    },

    renderAccountsTableItemExtraControls() {
        return undefined;
    },

    renderSchedulingTableItemExtraControls() {
        return undefined;
    },

    renderBundlesTableItemExtraControls() {
        return undefined;
    },

    renderControlAbcService() {
        return undefined;
    },

    makeSupportContent() {
        return undefined;
    },

    getComponentForConsumerMetrics() {
        return undefined;
    },

    getComonentForQueueMetrics() {
        return undefined;
    },

    renderTableCellBundleEditorNotice() {
        return undefined;
    },

    getNodeDeployUrl() {
        return undefined;
    },

    getNodeNannyUrl() {
        return undefined;
    },

    renderAppNavigation(props) {
        return <AppNavigationComponent {...props} />;
    },

    createNotificationUrl() {
        return undefined;
    },

    wrapApp(app) {
        return app;
    },

    externalSchemaDescriptionSetup: {
        load(_cluster: string, _path: string) {
            return Promise.resolve({});
        },
    },

    getAclApi() {
        return defaultAclApi;
    },

    renderAclSubjectsSuggestControl(props) {
        return <YTSubjectSuggest {...props} />;
    },

    renderRolesLink() {
        return undefined;
    },

    getExternalSettings() {
        return [];
    },

    renderUserSuggest(props) {
        return <YTUserSuggest {...props} />;
    },

    getAdminPages() {
        return adminPages;
    },

    docsUrls: docsUrls,

    getComponentForAclRoleActions() {
        return RoleActions;
    },

    getAclPermissionsSettings() {
        return PERMISSIONS_SETTINGS;
    },
};

function configureUIFactoryItem<K extends keyof UIFactory>(k: K, redefinition: UIFactory[K]) {
    uiFactory[k] = redefinition;
}

export function configureUIFactory(overrides: Partial<UIFactory>) {
    _.forEach(overrides, (_v, k) => {
        const key = k as keyof UIFactory;
        configureUIFactoryItem(key, overrides[key]!);
    });
}

export default new Proxy(uiFactory, {
    set: () => {
        throw new Error('Use configureUIFactory(...) method instead of direct modifications');
    },
});

export function isAbcAllowed() {
    const abc = uiFactory.renderControlAbcService({
        onChange: () => {},
        value: {id: 123, slug: '123'},
    });
    return Boolean(abc);
}
