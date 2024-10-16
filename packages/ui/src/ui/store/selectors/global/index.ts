import {createSelector} from 'reselect';

import flatten_ from 'lodash/flatten';
import filter_ from 'lodash/filter';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';
import orderBy_ from 'lodash/orderBy';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';
import uniq_ from 'lodash/uniq';
import values_ from 'lodash/values';

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
import {getConfigData, userSettingsCluster} from '../../../config/ui-settings';
import {Page} from '../../../../shared/constants/settings';
import {AuthWay} from '../../../../shared/constants';

export const getGlobalError = (state: RootState) => state.global.error.error;
export const getGlobalErrorType = (state: RootState) => state.global.error.errorType;

export const getCluster = (state: RootState): string => state?.global?.cluster || '';
export const getRootPagesCluster = (state: RootState) => state?.global.rootPagesCluster;

export const getGlobalLoadState = (state: RootState) => state.global.loadState;

export const getTheme = (state: RootState): '' | 'dark' | 'light' => state.global.theme;

export const getClusterUiConfig = (state: RootState) => state.global.clusterUiConfig;

export const getCliqueControllerIsSupported = createSelector([getClusterUiConfig], (uiConfig) => {
    return {
        chyt: Boolean(uiConfig.chyt_controller_base_url),
        spyt: Boolean(uiConfig.livy_controller_base_url),
    };
});

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
    return !getConfigData().ytApiUseCORS;
}

export function getClusterProxy(clusterConfig: ClusterConfig): string {
    const allowYtTvmApi = !getConfigData().ytApiUseCORS;
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

export const getPoolTrees = (state: RootState) => state?.global?.poolTrees;
export const getAllAccounts = (state: RootState) => state.global.accounts;
export const getBundles = (state: RootState) => state?.global.bundles;
export const getGlobalUsers = (state: RootState) => state.global.users;
export const getGlobalGroups = (state: RootState) => state.global.groups;
export const getCurrentUserName = (state: RootState): string => state?.global?.login;
export const getAuthWay = (state: RootState): AuthWay => state?.global?.authWay;

export const getAllowedExperimentalPages = (state: RootState) =>
    state?.global.allowedExperimentalPages;

const isDeveloperRaw = (state: RootState): boolean => state?.global?.isDeveloper;

export const isDeveloperOrWatchMen = createSelector(
    [isDeveloperRaw, getCurrentUserName],
    (isDeveloper, login) => {
        return YT.isLocalCluster || UIFactory.isWatchMen(login) || isDeveloper;
    },
);

export const isDeveloper = createSelector(
    [isDeveloperOrWatchMen, getSettingsRegularUserUI],
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
    return map_(usersData, ({$value}) => $value as string);
});

export const getAllGroupNames = createSelector([getGlobalGroups], (groupsData) => {
    return map_(groupsData, ({$value}) => $value as string);
});

export const getGlobalGroupAttributesMap = createSelector([getGlobalGroups], (data) => {
    return reduce_(
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
        return reduce_(
            keys_(obj),
            (res: FIX_MY_TYPE, key: FIX_MY_TYPE) => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    return [...res, key, ...getAllKeys(obj[key])];
                }

                return [...res, key];
            },
            [],
        );
    };

    return orderBy_(uniq_(flatten_(map_(values_(poolTrees), getAllKeys))));
});

export const getAllPoolTreeNames = createSelector(getPoolTrees, (poolTrees) => {
    return keys_(poolTrees);
});

export const getAllBundlesNames = createSelector(getBundles, (bundles) => {
    const bundleNames = map_(bundles, (bundle) => ypath.getValue(bundle, ''));

    return sortBy_(bundleNames);
});

export const getAllUserNamesSorted = createSelector(
    [getAllUserNames],
    sortBy_ as (items: Array<unknown>) => Array<string>,
);

export const getAllGroupNamesSorted = createSelector(
    [getAllGroupNames],
    sortBy_ as (items: Array<unknown>) => Array<string>,
);

export const getAllIdmGroupNamesSorted = createSelector(
    [getAllGroupNamesSorted, getGlobalGroupAttributesMap],
    (names, attrs) => {
        return filter_(names, (name) =>
            flags.get(attrs[name]['upravlyator_managed'] as FIX_MY_TYPE),
        );
    },
);

export const getGlobalShowLoginDialog = (state: RootState) => {
    if (state.global.authWay) {
        return (
            getConfigData().allowLoginDialog &&
            state.global.ytAuthCluster &&
            (!state.global.login || state.global.showLoginDialog)
        );
    }

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

export const getGlobalYTAuthCluster = (state: RootState) => state.global.ytAuthCluster;

export const getSettingsCluster = createSelector([getCluster], (cluster) => {
    return userSettingsCluster ?? cluster;
});
