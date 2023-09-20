import {AppConfig} from '@gravity-ui/nodekit';

const e2eConfig: Partial<AppConfig> = {
    uiSettings: {
        newTableReplicasCount: 1,
        uploadTableMaxSize: 50 * 1024 * 1024,
        uploadTableUseLocalmode: true,
        queryTrackerStage: 'testing',
        directDownload: false,
        docsBaseUrl: process.env.YT_DOCS_BASE_URL || 'https://ytsaurus.tech/docs/en',
        schedulingMonitoring: {
            title: 'My monitoring',
            urlTemplate:
                'https://monitoring-service.my-domain.com/d/DB-id?var-pool={ytPool}&var-cluster={ytCluster}&var-tree={ytPoolTree}',
        },
        accountsMonitoring: {
            title: 'My monitoring',
            urlTemplate:
                'https://my.monitoring.service/accounts?cluster={ytCluster}&account={ytAccount}',
        },
        bundlesMonitoring: {
            title: 'My monitoring',
            urlTemplate:
                'https://my.monitoring.service/bundles?cluster={ytCluster}&bundle={ytTabletCellBundle}',
        },
        operationsMonitoring: {
            title: 'My monitoring',
            urlTemplate:
                'https://my.monitoring.service/operations?cluster={ytCluster}&id={ytOperationId}&pool={ytPool}&tree={ytPoolTree}&from={fromTimeMs}&to={toTimeMs}',
        },
    },

    defaultUserSettingsOverrides: {
        ['global::navigation::useSmartSort']: false,
    },
};

export default e2eConfig;
