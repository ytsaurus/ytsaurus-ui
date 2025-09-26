import React from 'react';

import {YT} from '../config/yt-config';

import {getConfigData, uiSettings} from '../config/ui-settings';
import {PERMISSIONS_SETTINGS} from '../constants/acl';
import {docsUrls} from '../constants/docsUrls';
import {SchedulingExtraTabs} from '../constants/scheduling';

import {DefaultSubjectLinkLazy} from '../components/SubjectLink/lazy';
import type {SubjectCardProps} from '../components/SubjectLink/SubjectLink';

import {RoleActionsLazy} from '../containers/ACL';
import {YTSubjectSuggestLazy} from '../containers/ACL/SubjectsControl/lazy';

import {SupportComponentLazy} from '../containers/SupportComponent/lazy';
import {YTUserSuggestLazy} from '../containers/UserSuggest/YTUserSuggestLazy';

import OperationDetailMonitorLinks from '../pages/operations/OperationDetail/tabs/monitor/OperationDetailsMonitorLinks';
import {QUERY_RESULT_CHART_TAB} from '../pages/query-tracker/QueryResultsVisualization';
import {IncarnationsLazy} from '../pages/operations/OperationDetail/tabs/incarnations/IncarnationsLazy';
import {AppNavigationPageLayoutLazy} from '../containers/AppNavigation/AppNavigationPageLayout.lazy';

import {AccountsMonitoringPrometheusLazy} from '../pages/accounts/tabs/monitor/AccountsMonitorPromehteus/lazy';
import {QueueMetricsPrometheus} from '../pages/navigation/tabs/Queue/views/QueueMetrics/QueueMetricsPrometheus/QueueMetricsPrometheus';
import {ConsumerMetricsPrometheus} from '../pages/navigation/tabs/Consumer/views/ConsumerMetrics/ConsumerMetricsPrometheus/ConsumerMetricsPrometheus';
import {ChytMonitoringPrometheus} from '../pages/chyt/ChytPageClique/ChytMonitoringPrometheus';
import {SchedulingMonitoringLazy} from '../pages/scheduling/Content/tabs/Monitoring/lazy';
import {SystemMonitoringPrometheusLazy} from '../pages/system/SystemMonitoringPrometheus/lazy';
import {BundleMonitoringPrometheusLazy} from '../pages/tablet_cell_bundles/bundle/BundleMonitoringPrometheus/lazy';
import {OperationMonitoringPrometheus} from '../pages/operations/OperationDetail/tabs/monitor/OperationMonitoringPrometheus';
import {JobMonitoringPrometheus} from '../pages/operations/OperationDetail/tabs/JobsMonitor/JobMonitoringPrometheus/JobMonitoringPrometheus';
import {NavigationFlowMonitoringPrometheus} from '../pages/navigation/tabs/Flow/FlowMonitoringPrometheus/FlowMonitoringPrometheus';

import {defaultAclApi} from '../utils/acl/external-acl-api';

import {UIFactory} from './index';

const experimentalPages: string[] = [];

export const defaultUIFactory: UIFactory = {
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
        const res = [];

        if (getConfigData().allowPrometheusDashboards) {
            res.push({
                name: SchedulingExtraTabs.PROMETHEUS_DASHBOARD,
                title: 'Monitoring',
                component: SchedulingMonitoringLazy,
            });
        }

        if (uiSettings.schedulingMonitoring?.urlTemplate) {
            const {urlTemplate, title = 'Monitoring'} = uiSettings.schedulingMonitoring;
            res.push({
                name: 'monitoring',
                title,
                urlTemplate,
            });
        }

        return res;
    },
    getSystemMonitoringTab() {
        if (getConfigData().allowPrometheusDashboards) {
            return {component: SystemMonitoringPrometheusLazy};
        }
        if (!uiSettings?.systemMonitoring) return undefined;
        return uiSettings.systemMonitoring;
    },
    getVersionMonitoringLink() {
        if (!uiSettings?.componentVersionsMonitoring) return undefined;
        return uiSettings.componentVersionsMonitoring;
    },
    getMonitoringForAccounts() {
        if (getConfigData().allowPrometheusDashboards) {
            return {component: AccountsMonitoringPrometheusLazy};
        }

        if (!uiSettings?.accountsMonitoring?.urlTemplate) {
            return undefined;
        }

        const {urlTemplate, title} = uiSettings.accountsMonitoring;
        return {urlTemplate, title};
    },
    getMonitoringForBundle() {
        if (getConfigData().allowPrometheusDashboards) {
            return {component: BundleMonitoringPrometheusLazy};
        }
        if (!uiSettings.bundlesMonitoring?.urlTemplate) {
            return undefined;
        }

        const {urlTemplate, title} = uiSettings.bundlesMonitoring;
        return {urlTemplate, title};
    },
    getMonitoringForOperation(params) {
        if (getConfigData().allowPrometheusDashboards) {
            return {component: OperationMonitoringPrometheus};
        }

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
        if (getConfigData().allowPrometheusDashboards) {
            return JobMonitoringPrometheus;
        }
        return undefined;
    },
    getMonitoringComponentForChyt() {
        if (getConfigData().allowPrometheusDashboards) {
            return {component: ChytMonitoringPrometheus};
        }

        const {urlTemplate, title} = uiSettings.chytMonitoring ?? {};
        if (!urlTemplate) {
            return undefined;
        }

        return {urlTemplate, title};
    },
    getMonitoringComponentForNavigationFlow() {
        if (getConfigData().allowPrometheusDashboards) {
            return {component: NavigationFlowMonitoringPrometheus};
        }

        const {urlTemplate, title} = uiSettings.navigationFlowMonitoring ?? {};
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
        return <DefaultSubjectLinkLazy {...props} />;
    },

    makeSupportContent(_x, makeContent) {
        const {reportBugUrl} = uiSettings;
        if (!reportBugUrl) {
            return undefined;
        }

        return <SupportComponentLazy makeContent={makeContent} />;
    },

    getComponentForConsumerMetrics() {
        if (getConfigData().allowPrometheusDashboards) {
            return ConsumerMetricsPrometheus;
        }
        return undefined;
    },

    getComonentForQueueMetrics() {
        if (getConfigData().allowPrometheusDashboards) {
            return QueueMetricsPrometheus;
        }
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
        return undefined;
    },

    renderAppNavigation(props) {
        return <AppNavigationPageLayoutLazy {...props} />;
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
        return <YTSubjectSuggestLazy {...props} />;
    },

    renderRolesLink() {
        return undefined;
    },

    getQueryResultChartTab() {
        return QUERY_RESULT_CHART_TAB;
    },

    getExternalSettings() {
        return [];
    },

    renderUserSuggest(props) {
        return <YTUserSuggestLazy {...props} />;
    },

    getExperimentalPages() {
        return experimentalPages;
    },

    getAllowedExperimentalPages() {
        return Promise.resolve([]);
    },

    docsUrls: docsUrls,

    getComponentForAclRoleActions() {
        return RoleActionsLazy;
    },

    getAclPermissionsSettings() {
        return PERMISSIONS_SETTINGS;
    },

    onChytAliasSqlClick: undefined,

    getNavigationExtraTabs() {
        return [];
    },

    getMapNodeExtraCreateActions(baseActions) {
        return {
            menuItems: baseActions,
            renderModals: () => undefined,
        };
    },
    getNavigationMapNodeSettings() {
        return undefined;
    },
    renderCustomPreloaderError() {
        return null;
    },
    getInlineSuggestionsApi() {
        return undefined;
    },
    renderMarkdown() {
        return undefined;
    },
    getAnalyticsService() {
        return [];
    },
    renderIncarnationsTab() {
        return <IncarnationsLazy />;
    },
    renderOperationLogsTab() {
        return undefined;
    },
    renderJobLogsTab() {
        return undefined;
    },
    getAiChatMessageComponent() {
        return undefined;
    },
};
