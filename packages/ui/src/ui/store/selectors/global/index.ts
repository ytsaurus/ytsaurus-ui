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

export * from './cluster';
export * from './username';

import {selectCluster} from './cluster';
import {selectIsAdmin} from './is-developer';

export const selectGlobalError = (state: RootState) => state.global.error?.error;
export const selectGlobalErrorType = (state: RootState) => state.global.error?.errorType;

export const selectRootPagesCluster = (state: RootState) => state?.global.rootPagesCluster;

export const selectGlobalLoadState = (state: RootState) => state.global.loadState;

export const selectTheme = (state: RootState) => state.global.theme;

export const selectPage = (state: RootState) => state.global.page;

export function isAllowYtTwmApi() {
    return !getConfigData().ytApiUseCORS;
}

export const selectPoolTrees = (state: RootState) => state?.global?.poolTrees;
export const selectAllAccounts = (state: RootState) => state.global.accounts;
export const selectBundles = (state: RootState) => state?.global.bundles;
export const selectGlobalUsers = (state: RootState) => state.global.users;
export const selectGlobalGroups = (state: RootState) => state.global.groups;
export const selectAuthWay = (state: RootState) => state?.global?.authWay;

export const selectAllUserNames = createSelector([selectGlobalUsers], (usersData) => {
    return map_(usersData, ({$value}) => $value as string);
});

export const selectAllGroupNames = createSelector([selectGlobalGroups], (groupsData) => {
    return map_(groupsData, ({$value}) => $value as string);
});

export const selectGlobalGroupAttributesMap = createSelector([selectGlobalGroups], (data) => {
    return reduce_(
        data,
        (acc, {$value, $attributes}) => {
            acc[$value] = $attributes;
            return acc;
        },
        {} as Record<string, {upravlyator_managed: boolean}>,
    );
});

export const selectAllPoolNames = createSelector(selectPoolTrees, (poolTrees) => {
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

export const selectAllPoolTreeNames = createSelector(selectPoolTrees, (poolTrees) => {
    return keys_(poolTrees);
});

export const selectAllBundlesNames = createSelector(selectBundles, (bundles) => {
    const bundleNames = map_(bundles, (bundle) => ypath.getValue(bundle, ''));

    return sortBy_(bundleNames);
});

export const selectAllUserNamesSorted = createSelector(
    [selectAllUserNames],
    sortBy_ as (items: Array<unknown>) => Array<string>,
);

export const selectAllGroupNamesSorted = createSelector(
    [selectAllGroupNames],
    sortBy_ as (items: Array<unknown>) => Array<string>,
);

export const getAllIdmGroupNamesSorted = createSelector(
    [selectAllGroupNamesSorted, selectGlobalGroupAttributesMap],
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

export const getUserManagementEnabled = createSelector([selectIsAdmin], (isAdmin) => {
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

export const getSettingsCluster = createSelector([selectCluster], (cluster) => {
    return userSettingsCluster ?? cluster;
});
