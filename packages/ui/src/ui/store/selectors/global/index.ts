import {createSelector} from 'reselect';
import _ from 'lodash';

// @ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {flags, getClusterConfig} from '../../../utils';
import {getSettingsRegularUserUI} from '../settings-ts';

import {RootState} from '../../../store/reducers';
import YT from '../../../config/yt-config';
import {getClusterNS} from '../settings';
import {ClusterConfig} from '../../../../shared/yt-types';
import {FIX_MY_TYPE} from '../../../types';
import UIFactory from '../../../UIFactory';
import {getConfigData} from '../../../config/ui-settings';
import {isSupportedYtTvmAPIGlobal} from '../thor/support';
import {Page} from '../../../../shared/constants/settings';
import {AuthWay} from '../../../../shared/constants';

export const getGlobalError = (state: RootState) => state.global.error.error;

export const getCluster = (state: RootState): string => state?.global?.cluster || '';
export const getRootPagesCluster = (state: RootState) => state?.global.rootPagesCluster;

export const getGlobalLoadState = (state: RootState) => state.global.loadState;

export const getTheme = (state: RootState): '' | 'dark' | 'light' => state.global.theme;

export const getClusterUiConfig = (state: RootState) => state.global.clusterUiConfig;

export const getClusterUiConfigEnablePerAccountTabletAccounting = (state: RootState) => {
    return state.global.clusterUiConfig.enable_per_account_tablet_accounting ?? false;
};
export const getClusterUiConfigEnablePerBundleTabletAccounting = (state: RootState) =>
    state.global.clusterUiConfig.enable_per_bundle_tablet_accounting ?? true;
export const getClusterUiConfigBundleAccountingHelpLink = (state: RootState) =>
    state.global.clusterUiConfig.per_bundle_accounting_help_link;

export const getCurrentClusterConfig = createSelector([getCluster], (cluster): ClusterConfig => {
    return getClusterConfig(YT.clusters, cluster);
});

export function getClusterConfigByName(clusterName: string): ClusterConfig {
    return getClusterConfig(YT.clusters, clusterName);
}

export function isAllowYtTwmApi() {
    return !getConfigData().ytApiUseCORS && isSupportedYtTvmAPIGlobal();
}

export function getClusterProxy(clusterConfig: ClusterConfig): string {
    const allowYtTvmApi = isAllowYtTwmApi();
    if (allowYtTvmApi) {
        return `${window.location.host}/api/yt/${clusterConfig.id}`;
    }
    return clusterConfig.proxy;
}

export const getHttpProxyVersion = createSelector(
    [getCluster, (state: RootState) => state.global.version],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const getGlobalSchedulerVersion = createSelector(
    [getCluster, (state: RootState) => state.global.schedulerVersion],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const getGlobalMasterVersion = createSelector(
    [getCluster, (state: RootState) => state.global.masterVersion],
    (cluster, version) => {
        return cluster ? version : '';
    },
);

export const getCurrentClusterNS = createSelector([getCluster, getClusterNS], (cluster, ns) => {
    return cluster ? ns : undefined;
});

export const getUISizes = () => {
    return {
        tabSize: 'l' as const,
        collapsibleSize: 'ss' as const,
    };
};

export const getPoolTrees = (state: RootState) => state?.global?.poolTrees;
export const getAllAccounts = (state: RootState) => state.global.accounts;
export const getBundles = (state: RootState) => state?.global.bundles;
export const getGlobalUsers = (state: RootState) => state.global.users;
export const getGlobalGroups = (state: RootState) => state.global.groups;
export const getCurrentUserName = (state: RootState): string => state?.global?.login;
export const getAuthWay = (state: RootState): AuthWay => state?.global?.authWay;

export const getAllowedExperimentalPages = (state: RootState) =>
    state?.global.allowedExperimentalPages;

const isCheckedDeveloper = (state: RootState): boolean => state?.global?.isDeveloper;

export const isDeveloperSettings = createSelector(
    [isCheckedDeveloper, getCurrentUserName],
    (isDeveloper, login) => {
        return YT.isLocalCluster || UIFactory.isWatchMen(login) || isDeveloper;
    },
);

export const isDeveloper = createSelector(
    [isDeveloperSettings, getSettingsRegularUserUI],
    (isDeveloper, regularUserUI) => {
        return !regularUserUI && isDeveloper;
    },
);

export const isQueryTrackerAllowed = createSelector(
    [isDeveloper, getAllowedExperimentalPages],
    (isDeveloper, allowedPages) => {
        const expPages = UIFactory.getExperimentalPages();
        return (
            isDeveloper || !expPages.includes(Page.QUERIES) || allowedPages.includes(Page.QUERIES)
        );
    },
);

export const getAllUserNames = createSelector([getGlobalUsers], (usersData) => {
    return _.map(usersData, ({$value}) => $value as string);
});

export const getAllGroupNames = createSelector([getGlobalGroups], (groupsData) => {
    return _.map(groupsData, ({$value}) => $value as string);
});

export const getGlobalGroupAttributesMap = createSelector([getGlobalGroups], (data) => {
    return _.reduce(
        data,
        (acc, {$value, $attributes}) => {
            acc[$value] = $attributes;
            return acc;
        },
        {} as Record<string, {upravlyator_managed: boolean}>,
    );
});

export const getAllPoolNames = createSelector(getPoolTrees, (poolTrees) => {
    const getAllKeys = (obj: FIX_MY_TYPE): Array<string> => {
        return _.reduce(
            _.keys(obj),
            (res: FIX_MY_TYPE, key: FIX_MY_TYPE) => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    return [...res, key, ...getAllKeys(obj[key])];
                }

                return [...res, key];
            },
            [],
        );
    };

    return _.orderBy(_.uniq(_.flatten(_.map(_.values(poolTrees), getAllKeys))));
});

export const getAllPoolTreeNames = createSelector(getPoolTrees, (poolTrees) => {
    return _.keys(poolTrees);
});

export const getAllBundlesNames = createSelector(getBundles, (bundles) => {
    const bundleNames = _.map(bundles, (bundle) => ypath.getValue(bundle, ''));

    return _.sortBy(bundleNames);
});

export const getAllUserNamesSorted = createSelector(
    [getAllUserNames],
    _.sortBy as (items: Array<unknown>) => Array<string>,
);

export const getAllGroupNamesSorted = createSelector(
    [getAllGroupNames],
    _.sortBy as (items: Array<unknown>) => Array<string>,
);

export const getAllIdmGroupNamesSorted = createSelector(
    [getAllGroupNamesSorted, getGlobalGroupAttributesMap],
    (names, attrs) => {
        return _.filter(names, (name) =>
            flags.get(attrs[name]['upravlyator_managed'] as FIX_MY_TYPE),
        );
    },
);

export const getGlobalDefaultPoolTreeName = (state: RootState) =>
    state.global.poolTreeDefault || 'physical';

export const getGlobalShowLoginDialog = (state: RootState) => {
    return (
        getConfigData().allowLoginDialog && (!state.global.login || state.global.showLoginDialog)
    );
};

export const getAuthPagesEnabled = () => {
    return getConfigData().allowLoginDialog;
};

export const getOAuthEnabled = () => {
    return getConfigData().allowOAuth;
};

export const getOAuthButtonLabel = () => {
    return getConfigData().oauthButtonLabel;
};

export const getGlobalAsideHeaderWidth = (state: RootState) => state.global.asideHeaderWidth;
