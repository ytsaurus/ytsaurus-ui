import {AppConfig} from '@gravity-ui/nodekit';
import common from '../common';

const e2eConfig: Partial<AppConfig> = {
    uiSettings: {
        defaultFontType: 'internal',
        newTableReplicasCount: 1,
        uploadTableMaxSize: 50 * 1024 * 1024,
        uploadTableUseLocalmode: true,
        queryTrackerStage: 'testing',
        directDownload: false,
        docsBaseUrl: 'https://ytsaurus.tech/docs/en',
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
        systemMonitoring: {
            title: 'My monitoring',
            urlTemplate: 'https://my.monitoring.service/system?cluster={ytCluster}',
        },
        componentVersionsMonitoring: {
            title: 'My monitoring',
            urlTemplate: 'https://my.monitoring.service/component-versions?cluster={ytCluster}',
        },

        reShortNameFromAddress: '(?<shortname>^(loca)).*(?<suffix>:\\d\\d\\d)',
        reShortNameSystemPage: '(?<shortname>^(local))',
        reShortNameFromTabletNodeAddress: '(?<shortname>^(local))[^:]+(?<suffix>:\\d\\d)',

        reUnipikaAllowTaggedSources: ['^https://yastatic\\.net/'],
        hideReferrerUrl: 'https://h.yandex-team.ru/',
        reUseEffectiveAclForPath: '//sys/access_control_object_namespaces[^/+]{0,}',
    },

    userColumnPresets: {
        cluster: 'ui',
        dynamicTablePath: '//tmp/userColumnPresets',
    },

    defaultUserSettingsOverrides: {
        ...common.defaultUserSettingsOverrides,
        ['global::navigation::useSmartSort']: false,
        ['global::development::yqlTypes']: true,
    },

    localmodeClusterConfig: {
        urls: {
            icon: 'https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui.bab31938.jpg',
            icon2x: 'https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-2x.38d49f78.jpg',
            iconbig:
                'https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-big.44e3fa56.jpg',
        },
        externalProxy: 'external.proxy.my',
    },
};

export default e2eConfig;
