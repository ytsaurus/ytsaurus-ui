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

import {FIX_MY_TYPE} from '../../../types';

import {flags} from '../../../utils';

import type {RootState} from '../../../store/reducers';
import {getConfigData, userSettingsCluster} from '../../../config/ui-settings';
import type {AuthWay} from '../../../../shared/constants';

export * from './cluster';
export * from './username';

import {getCluster} from './cluster';
import {isDeveloper} from './is-developer';

export const getGlobalError = (state: RootState) => state.global.error.error;
export const getGlobalErrorType = (state: RootState) => state.global.error.errorType;

export const getRootPagesCluster = (state: RootState) => state?.global.rootPagesCluster;

export const getGlobalLoadState = (state: RootState) => state.global.loadState;

export const getTheme = (state: RootState): '' | 'dark' | 'light' => state.global.theme;

export function isAllowYtTwmApi() {
    return !getConfigData().ytApiUseCORS;
}

export const getPoolTrees = (state: RootState) => state?.global?.poolTrees;
export const getAllAccounts = (state: RootState) => state.global.accounts;
export const getBundles = (state: RootState) => state?.global.bundles;
export const getGlobalUsers = (state: RootState) => state.global.users;
export const getGlobalGroups = (state: RootState) => state.global.groups;
export const getAuthWay = (state: RootState): AuthWay => state?.global?.authWay;

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
            getConfigData().allowPasswordAuth &&
            state.global.ytAuthCluster &&
            (!state.global.login || state.global.showLoginDialog)
        );
    }

    return (
        getConfigData().allowPasswordAuth && (!state.global.login || state.global.showLoginDialog)
    );
};

export const getAuthPagesEnabled = () => {
    return getConfigData().allowPasswordAuth;
};

export const getUserManagementEnabled = createSelector([isDeveloper], (isAdmin) => {
    return isAdmin && getConfigData().allowPasswordAuth;
});

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
