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

        reShortNameFromAddress: '(?<shortname>^(loca)).*(?<suffix>:\\d\\d\\d)',
        reShortNameFromTabletNodeAddress: '(?<shortname>^(local))[^:]+(?<suffix>:\\d\\d)',
    },

    defaultUserSettingsOverrides: {
        ['global::navigation::useSmartSort']: false,
    },

    localmodeClusterUrls: {
        icon: 'https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui.bab31938.jpg',
        icon2x: 'https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-2x.38d49f78.jpg',
        iconbig: 'https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-big.44e3fa56.jpg',
    },
};

export default e2eConfig;
