import React from 'react';
import AppNavigationPageLayout from '../containers/AppNavigation/AppNavigationPageLayout';
import {defaultAclApi} from '../utils/acl/external-acl-api';
import {SupportComponentLazy} from '../containers/SupportComponent/lazy';
import {YTUserSuggestLazy} from '../containers/UserSuggest/YTUserSuggestLazy';
import {docsUrls} from '../constants/docsUrls';
import {YTSubjectSuggestLazy} from '../containers/ACL/SubjectsControl/lazy';
import {RoleActionsLazy} from '../containers/ACL';
import OperationDetailMonitorLinks from '../pages/operations/OperationDetail/tabs/monitor/OperationDetailsMonitorLinks';
import {PERMISSIONS_SETTINGS} from '../constants/acl';
import {uiSettings} from '../config/ui-settings';
import YT from '../config/yt-config';
import {DefaultSubjectLinkLazy} from '../components/SubjectLink/lazy';
import type {SubjectCardProps} from '../components/SubjectLink/SubjectLink';
import {CUSTOM_QUERY_REQULT_TAB} from '../pages/query-tracker/QueryResultsVisualization';

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
    getMonitoringComponentForNavigationFlow() {
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
        return <YTSubjectSuggestLazy {...props} />;
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
    getNavigationMapNodeSettings() {
        return undefined;
    },
    renderCustomPreloaderError() {
        return null;
    },
};
