import React from 'react';
import type {Reducer} from 'redux';
import forEach_ from 'lodash/forEach';

import type {DropdownMenuItem} from '@gravity-ui/uikit';
import type {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import type {MetaTableItem} from '../components/MetaTable/MetaTable';
import type {PathParameters} from '../store/location';
import type {TabletBundle} from '../store/reducers/tablet_cell_bundles';
import type {PoolInfo} from '../store/selectors/scheduling/scheduling-pools';
import type {ClusterConfig, ClusterUiConfig} from '../../shared/yt-types';
import type {ClusterAppearance} from '../appearance';
import type {AppNavigationProps} from '../containers/AppNavigation/AppNavigationPageLayout';
import type {ExternalSchemaDescription} from '../pages/navigation/tabs/Schema/ExternalDescription/ExternalDescription';
import type {AclApi} from '../utils/acl/external-acl-api';
import type {SubjectsControlProps} from '../containers/ACL/SubjectsControl/SubjectsControl';
import type {SettingsPage} from '../containers/SettingsPanel/settings-description';
import type {UserSuggestProps} from '../containers/UserSuggest/UserSuggest';
import type {DocsUrls} from '../constants/docsUrls';
import type {Props as RoleActionsProps} from '../containers/ACL/RoleActions';

import type {PERMISSIONS_SETTINGS} from '../constants/acl';
import type {PreparedAclSubject} from '../utils/acl/acl-types';
import type {PreparedRole} from '../utils/acl';
import type {UISettingsMonitoring} from '../../shared/ui-settings';
import type {SubjectCardProps} from '../components/SubjectLink/SubjectLink';
import type {QueryItem} from '../pages/query-tracker/module/api';
import type {Node} from '../utils/navigation/content/map-nodes/node';
import type {PreloadErrorType} from '../constants';

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

export type NavigationFlowMonitoringProps = {
    cluster: string;
    monitoring_cluster?: string;
    monitoring_project?: string;
    attributes: unknown;
};

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

    getMonitoringComponentForNavigationFlow():
        | undefined
        | {
              component?: React.ComponentType<NavigationFlowMonitoringProps>;
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

    getNavigationMapNodeSettings():
        | undefined
        | {
              additionalAttributes: Array<string>;
              renderNodeIcon: (item: Node) => React.ReactNode;
          };

    renderCustomPreloaderError: (params: {
        cluster: string;
        errorType: PreloadErrorType;
        error: Error;
    }) => React.ReactNode;
}

// All methods comes from `configureUIFactory` method
const uiFactory: UIFactory = {} as any;

function configureUIFactoryItem<K extends keyof UIFactory>(k: K, redefinition: UIFactory[K]) {
    uiFactory[k] = redefinition;
}

export function configureUIFactory(overrides: UIFactory) {
    forEach_(overrides, (_v, k) => {
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
