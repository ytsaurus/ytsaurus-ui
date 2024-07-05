import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import {MetaTableItem} from './components/MetaTable/MetaTable';
import _ from 'lodash';
import React from 'react';
import {Reducer} from 'redux';
import {PathParameters} from './store/location';
import {TabletBundle} from './store/reducers/tablet_cell_bundles';
import {PoolInfo} from './store/selectors/scheduling/scheduling-pools';
import {ClusterConfig, ClusterUiConfig} from '../shared/yt-types';
import {ClusterAppearance} from './appearance';
import AppNavigationPageLayout, {
    AppNavigationProps,
} from './containers/AppNavigation/AppNavigationPageLayout';
import {ExternalSchemaDescription} from './pages/navigation/tabs/Schema/ExternalDescription/ExternalDescription';
import {AclApi, defaultAclApi} from './utils/acl/external-acl-api';
import {SubjectsControlProps} from './containers/ACL/SubjectsControl/SubjectsControl';
import {SettingsPage} from './containers/SettingsPanel/settings-description';
import {SupportComponent} from './containers/SupportComponent/SupportComponent';
import {UserSuggestProps} from './containers/UserSuggest/UserSuggest';
import {YTUserSuggest} from './containers/UserSuggest/YTUserSuggest';
import {DocsUrls, docsUrls} from './constants/docsUrls';
import {YTSubjectSuggest} from './containers/ACL/SubjectsControl/YTSubjectSuggest';
import RoleActions, {Props as RoleActionsProps} from './containers/ACL/RoleActions';
import OperationDetailMonitorLinks from './pages/operations/OperationDetail/tabs/monitor/OperationDetailsMonitorLinks';
import {PERMISSIONS_SETTINGS} from './constants/acl';
import {uiSettings} from './config/ui-settings';
import YT from './config/yt-config';
import {PreparedAclSubject} from './utils/acl/acl-types';
import {PreparedRole} from './utils/acl';
import {UISettingsMonitoring} from '../shared/ui-settings';
import {DefaultSubjectCard, type SubjectCardProps} from './components/SubjectLink/SubjectLink';
import type {QueryItem} from './pages/query-tracker/module/api';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {CUSTOM_QUERY_REQULT_TAB} from './pages/query-tracker/QueryResultsVisualization';

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
    reducers?: Record<string, Reducer<any, any>>;
    reactComponent: React.ComponentType<any>; // used as component for <Route ... component={reactComponent} />
    topRowComponent?: React.ComponentType<any>; // used as component for <Route ... component={topRowComponent} />
    urlMapping?: Record<string, PathParameters>;
}

export interface ExternalSchemaDescriptionResponse {
    url?: string;
    externalSchema?: Map<string, ExternalSchemaDescription>;
}

export interface ReducersAndUrlMapping {
    reducers?: Record<string, Reducer<any, any>>;
    urlMapping?: Record<string, PathParameters>;
}

export interface SchedulingExtraTab {
    name: string;
    title?: string;
    component?: React.ComponentType<any>;
    /**
     * Allows to redefine link of corresponding tab
     * Example: https://grafana.mydomain.com?var-pool={ytPool}&var-tree={ytPoolTree}&var-cluster={ytCluster}
     */
    urlTemplate?: string;
}

export interface OperationMonitoringTabProps {
    cluster: string;
    operation: {
        id: string;
        startTime?: string;
        finishTime?: string;
        pools?: Array<{pool: string; tree: string; slotIndex?: number}>;
    };
}

export type AclRoleActionsType = Partial<Omit<PreparedAclSubject | PreparedRole, 'type'>> & {
    type?: string;
};

export type TabName = string;

export type ExtraTab = {
    value: `extra_${TabName}`;
    title: string;
    text?: string;
    caption?: string;
    hotkey?: string;
    component: React.ComponentType;
    isSupported: (attributes: Record<string, any>) => boolean;
    position: {before: TabName} | {after: TabName};
};

export interface UIFactory {
    getClusterAppearance(cluster?: string): undefined | ClusterAppearance;

    isWatchMen(login: string): boolean;

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
    getSystemMonitoringTab():
        | {
              title?: string;
              urlTemplate: string;
          }
        | {
              title?: string;
              component: React.ComponentType<any>;
          }
        | undefined;
    getVersionMonitoringLink(cluster: string): UISettingsMonitoring | undefined;

    getMonitoringForAccounts():
        | undefined
        | {
              component: React.ComponentType<{cluster: string; account: string}>;
              urlTemplate?: undefined;
              title?: undefined;
          }
        | {urlTemplate: string; title?: string; component?: undefined};
    getMonitoringForBundle():
        | undefined
        | {
              component: React.ComponentType<{
                  cluster: string;
                  tablet_cell_bundle: string;
                  bundleData: any;
              }>;
              urlTemplate?: undefined;
              title?: undefined;
          }
        | {urlTemplate: string; title?: string; component?: undefined};
    getMonitoringForOperation(params: OperationMonitoringTabProps['operation']):
        | undefined
        | {
              component: React.ComponentType<OperationMonitoringTabProps>;
              urlTemplate?: undefined;
              title?: undefined;
          }
        | {urlTemplate: string; title?: string; component?: undefined};
    getMonitorComponentForJob():
        | undefined
        | React.ComponentType<{
              cluster: string;
              job_descriptor: string;
              from?: number;
              to?: number;
          }>;

    getMonitoringComponentForChyt():
        | undefined
        | {
              component?: React.ComponentType<{cluster: string; alias: string}>;
              urlTemplate?: string;
              title?: string;
          };

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

    renderSubjectCard(props: SubjectCardProps): React.ReactNode;

    makeSupportContent(
        params: {login: string; cluster?: string; buttonToWrap?: React.ReactNode},
        makeContent: (params: {
            supportContent?: React.ReactNode;
            onSupportClick: () => void;
        }) => React.ReactNode,
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

    renderAppFooter(): React.ReactNode;

    renderAppNavigation(props: AppNavigationProps): React.ReactElement;

    createNotificationUrl(clusterConfig?: ClusterConfig): string | undefined;

    wrapApp(app: React.ReactElement): React.ReactElement;

    externalSchemaDescriptionSetup: {
        columns?: Record<keyof ExternalSchemaDescription['glossaryEntity'], string>;
        load(cluster: string, path: string): Promise<ExternalSchemaDescriptionResponse>;
    };

    getAclApi(): AclApi;

    renderAclSubjectsSuggestControl(props: SubjectsControlProps): React.ReactNode;

    renderRolesLink(params: {cluster: string; login: string; className?: string}): React.ReactNode;

    getCustomQueryResultTab():
        | undefined
        | {
              title: string;
              renderContent: (params: {query: QueryItem}) => React.ReactNode;
          };

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

    getExperimentalPages(): string[];
    getAllowedExperimentalPages(login: string): Promise<Array<string>>;

    docsUrls: DocsUrls;

    getComponentForAclRoleActions(): undefined | React.ComponentType<RoleActionsProps>;

    getAclPermissionsSettings(): typeof PERMISSIONS_SETTINGS;

    onChytAliasSqlClick(params: {alias: string; cluster: string}): void;

    getNavigationExtraTabs(): Array<ExtraTab>;

    getMapNodeExtraCreateActions(baseActions: Array<DropdownMenuItem>): {
        menuItems: Array<DropdownMenuItem>;
        renderModals: () => React.ReactNode;
    };
}

const experimentalPages: string[] = [];

const uiFactory: UIFactory = {
    getClusterAppearance(cluster) {
        return YT.clusters[cluster!]?.urls;
    },
    isWatchMen() {
        return false;
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
        if (!uiSettings.schedulingMonitoring?.urlTemplate) {
            return [];
        }

        const {urlTemplate, title = 'Monitoring'} = uiSettings.schedulingMonitoring;

        return [
            {
                name: 'monitoring',
                title,
                urlTemplate,
            },
        ];
    },
    getSystemMonitoringTab() {
        if (!uiSettings?.systemMonitoring) return undefined;
        return uiSettings.systemMonitoring;
    },
    getVersionMonitoringLink() {
        if (!uiSettings?.componentVersionsMonitoring) return undefined;
        return uiSettings.componentVersionsMonitoring;
    },
    getMonitoringForAccounts() {
        if (!uiSettings?.accountsMonitoring?.urlTemplate) {
            return undefined;
        }

        const {urlTemplate, title} = uiSettings.accountsMonitoring;
        return {urlTemplate, title};
    },
    getMonitoringForBundle() {
        if (!uiSettings.bundlesMonitoring?.urlTemplate) {
            return undefined;
        }

        const {urlTemplate, title} = uiSettings.bundlesMonitoring;
        return {urlTemplate, title};
    },
    getMonitoringForOperation(params) {
        if (!uiSettings.operationsMonitoring?.urlTemplate) {
            return undefined;
        }

        const {urlTemplate, title} = uiSettings.operationsMonitoring;

        const hasPoolParameter =
            urlTemplate.indexOf('{ytPool}') !== -1 || urlTemplate.indexOf('{ytPoolTree}') !== -1;

        if (hasPoolParameter && params.pools?.length! > 1) {
            return {component: OperationDetailMonitorLinks};
        }

        return {urlTemplate, title};
    },
    getMonitorComponentForJob() {
        return undefined;
    },
    getMonitoringComponentForChyt() {
        const {urlTemplate, title} = uiSettings.chytMonitoring ?? {};
        if (!urlTemplate) {
            return undefined;
        }

        return {urlTemplate, title};
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

    renderSubjectCard(props: SubjectCardProps): React.ReactNode {
        return <DefaultSubjectCard {...props} />;
    },

    makeSupportContent(_x, makeContent) {
        const {reportBugUrl} = uiSettings;
        if (!reportBugUrl) {
            return undefined;
        }

        return <SupportComponent makeContent={makeContent} />;
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

    renderAppFooter() {
        return null;
    },

    renderAppNavigation(props) {
        return <AppNavigationPageLayout {...props} />;
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

    getCustomQueryResultTab() {
        return CUSTOM_QUERY_REQULT_TAB;
    },

    getExternalSettings() {
        return [];
    },

    renderUserSuggest(props) {
        return <YTUserSuggest {...props} />;
    },

    getExperimentalPages() {
        return experimentalPages;
    },

    getAllowedExperimentalPages() {
        return Promise.resolve([]);
    },

    docsUrls: docsUrls,

    getComponentForAclRoleActions() {
        return RoleActions;
    },

    getAclPermissionsSettings() {
        return PERMISSIONS_SETTINGS;
    },

    onChytAliasSqlClick() {},

    getNavigationExtraTabs() {
        return [];
    },

    getMapNodeExtraCreateActions(baseActions) {
        return {
            menuItems: baseActions,
            renderModals: () => undefined,
        };
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
