import {ThunkAction} from 'redux-thunk';

import isEmpty_ from 'lodash/isEmpty';

import ypath from '../../../common/thor/ypath';

import {listAllGroups, listAllUsers} from '../../../utils/users-groups';
import {normalizeResponseWithAttributes} from '../../../utils';
import {RootState} from '../../../store/reducers';
import {
    getBundles,
    getGlobalAsideHeaderWidth,
    getGlobalGroups,
    getGlobalUsers,
    getPoolTrees,
} from '../../../store/selectors/global';
import {Toaster} from '@gravity-ui/uikit';
import {showErrorPopup} from '../../../utils/utils';
import {GLOBAL_PARTIAL} from '../../../constants/global';
import {loadDefaultPoolTree, ytGetPoolTrees} from '../../../utils/poolTrees';
import {
    DEC_NAV_BLOCKER_COUNTER,
    GLOBAL_SET_THEME,
    INC_NAV_BLOCKER_COUNTER,
    MERGE_SCREEN,
    SPLIT_SCREEN,
    UPDATE_TITLE,
} from '../../../constants/index';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getWindowStore} from '../../../store/window-store';
import {reloadUserSettings} from '../settings';
import YT from '../../../config/yt-config';
import {getConfigData} from '../../../config/ui-settings';

export function setTheme(theme: 'light' | 'dark' | 'system' | 'light-hc' | 'dark-hc') {
    return {type: GLOBAL_SET_THEME, data: theme};
}

let usersInProgress = false;

export type YTThunkAction<T = unknown> = ThunkAction<T, RootState, any, any>;

export function setAsideHeaderWidth(asideHeaderWidth: number): YTThunkAction {
    return (dispatch, getState) => {
        const oldWidth = getGlobalAsideHeaderWidth(getState());
        if (oldWidth !== asideHeaderWidth) {
            dispatch({type: GLOBAL_PARTIAL, data: {asideHeaderWidth}});
        }
    };
}

export function loadUsersIfNotLoaded(): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        if (usersInProgress) {
            return Promise.resolve();
        }

        const users = getGlobalUsers(getState());
        if (users?.length) {
            return Promise.resolve();
        }

        usersInProgress = true;

        return listAllUsers(YTApiId.listUsersUM, {attributes: ['upravlyator_managed']})
            .then((users: Array<any>) => {
                dispatch({
                    type: GLOBAL_PARTIAL,
                    data: {users: normalizeResponseWithAttributes(users)},
                });
                usersInProgress = false;
            })
            .catch((e: any) => {
                usersInProgress = false;
                showErrorToaster(e, 'users', () => {
                    dispatch({
                        type: GLOBAL_PARTIAL,
                        data: {users: undefined},
                    });
                    dispatch(loadUsersIfNotLoaded());
                });
            });
    };
}

let groupsInProgress = false;

export function loadGroupsIfNotLoaded(): ThunkAction<Promise<void>, RootState, any, any> {
    return (dispatch, getState) => {
        if (groupsInProgress) {
            return Promise.resolve();
        }

        const groups = getGlobalGroups(getState());
        if (groups?.length) {
            return Promise.resolve();
        }

        groupsInProgress = true;

        return listAllGroups(YTApiId.listGroups, {attributes: ['upravlyator_managed']})
            .then((data: Array<any>) => {
                dispatch({
                    type: GLOBAL_PARTIAL,
                    data: {
                        groups: normalizeResponseWithAttributes(ypath.getValue(data)),
                    },
                });
                groupsInProgress = false;
            })
            .catch((e: any) => {
                groupsInProgress = false;
                showErrorToaster(e, 'groups', () => {
                    dispatch({
                        type: GLOBAL_PARTIAL,
                        data: {groups: undefined},
                    });
                    dispatch(loadGroupsIfNotLoaded());
                });
            });
    };
}

let accountsInProgress = false;
export function loadAccountsIfNotLoaded(): ThunkAction<Promise<void>, RootState, any, any> {
    return (dispatch, getState) => {
        if (accountsInProgress) {
            return Promise.resolve();
        }

        const groups = getGlobalGroups(getState());
        if (groups?.length) {
            return Promise.resolve();
        }

        accountsInProgress = true;

        return ytApiV3Id
            .list(YTApiId.listAccounts, {path: '//sys/accounts', ...USE_MAX_SIZE, ...USE_CACHE})
            .then((data: Array<any>) => {
                dispatch({
                    type: GLOBAL_PARTIAL,
                    data: {accounts: ypath.getValue(data)},
                });
                accountsInProgress = false;
            })
            .catch((e: any) => {
                accountsInProgress = false;
                showErrorToaster(e, 'accounts', () => {
                    dispatch({
                        type: GLOBAL_PARTIAL,
                        data: {accounts: undefined},
                    });
                    dispatch(loadAccountsIfNotLoaded());
                });
            });
    };
}

let bundlesInProgress = false;

export function loadBundlesIfNotLoaded(): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        if (bundlesInProgress) {
            return Promise.resolve();
        }

        const bundles = getBundles(getState());
        if (bundles?.length) {
            return Promise.resolve();
        }

        bundlesInProgress = true;

        return ytApiV3Id
            .list(YTApiId.listBundles, {
                path: '//sys/tablet_cell_bundles',
                attributes: ['nodes'],
                ...USE_MAX_SIZE,
                ...USE_CACHE,
            })
            .then((data: unknown) => {
                dispatch({
                    type: GLOBAL_PARTIAL,
                    data: {bundles: ypath.getValue(data)},
                });
                bundlesInProgress = false;
            })
            .catch((e: any) => {
                showErrorToaster(e, 'bundles', () => {
                    dispatch({
                        type: GLOBAL_PARTIAL,
                        data: {bundles: undefined},
                    });
                    dispatch(loadBundlesIfNotLoaded());
                });
                bundlesInProgress = false;
            });
    };
}

let poolTreesInProgress = false;
export function loadPoolTreesIfNotLoaded(): ThunkAction<Promise<void>, RootState, any, any> {
    return (dispatch, getState) => {
        if (poolTreesInProgress) {
            return Promise.resolve();
        }

        const trees = getPoolTrees(getState());
        if (!isEmpty_(trees)) {
            return Promise.resolve();
        }

        poolTreesInProgress = true;

        return Promise.all([ytGetPoolTrees(), loadDefaultPoolTree()])
            .then(([data, poolTreeDefault]) => {
                dispatch({
                    type: GLOBAL_PARTIAL,
                    data: {poolTrees: ypath.getValue(data), poolTreeDefault},
                });
                poolTreesInProgress = false;
            })
            .catch((e: any) => {
                showErrorToaster(e, 'pools', () => {
                    dispatch({
                        type: GLOBAL_PARTIAL,
                        data: {poolTrees: undefined, defaultPoolTree: undefined},
                    });
                    dispatch(loadPoolTreesIfNotLoaded());
                });
                poolTreesInProgress = false;
            });
    };
}

function showErrorToaster(
    error: any,
    listType: 'users' | 'groups' | 'bundles' | 'accounts' | 'pools',
    reloadFn: () => void,
) {
    const toaster = new Toaster();
    toaster.add({
        name: `global/${listType}`,
        autoHiding: false,
        theme: 'danger',
        content: 'If the problem persists, please report the error.',
        title: `Failed to load list of ${listType}`,
        actions: [
            {label: ' Details ', onClick: () => showErrorPopup(error)},
            {
                label: ' Reload ',
                onClick: reloadFn,
            },
        ],
    });
}

export function updateTitle({
    path,
    page,
    cluster,
}: {
    path?: string;
    page?: string;
    cluster?: string;
}): YTThunkAction {
    return (dispatch, getState) => {
        const clusters = getState().clustersMenu.clusters;
        dispatch({
            type: UPDATE_TITLE,
            data: {path, page, cluster, clusters},
        });
    };
}

export function addNavigationBlocker() {
    return {
        type: INC_NAV_BLOCKER_COUNTER,
    };
}

export function removeNavigationBlocker() {
    return {
        type: DEC_NAV_BLOCKER_COUNTER,
    };
}

export function setOngoingClusterEvents(cluster: string, events: Array<unknown>) {
    return {
        type: GLOBAL_PARTIAL,
        data: {ongoingEvents: {events, cluster}},
    };
}

export function splitScreen(type: string, paneClassNames: Array<string> = []) {
    document.body.style.overflow = 'hidden';

    return {
        type: SPLIT_SCREEN,
        data: {paneClassNames, type},
    };
}

export function mergeScreen() {
    document.body.style.overflow = '';

    return {
        type: MERGE_SCREEN,
    };
}

export function handleAuthError({ytAuthCluster}: {ytAuthCluster?: string} = {}) {
    if (getConfigData().allowPasswordAuth) {
        if (!ytAuthCluster) {
            const toaster = new Toaster();

            toaster.add({
                name: `global/ytAuthCluster}`,
                autoHiding: false,
                theme: 'danger',
                content: 'If the problem persists, please report the error.',
                title: `Failed to show a login form. ytAuthCluster is not defined`,
            });

            return;
        }

        getWindowStore().dispatch({
            type: GLOBAL_PARTIAL,
            data: {showLoginDialog: true, ytAuthCluster},
        });
    }
}

export function onSuccessLogin(login: string): YTThunkAction {
    return async (dispatch) => {
        try {
            await await dispatch(reloadUserSettings(login));
        } catch (e) {}
        YT.parameters.login = login;
        dispatch({
            type: GLOBAL_PARTIAL,
            data: {showLoginDialog: false, login, ytAuthCluster: undefined},
        });
    };
}

export function setRootPagesCluster(rootPagesCluster: string | undefined) {
    return {type: GLOBAL_PARTIAL, data: {rootPagesCluster}};
}
