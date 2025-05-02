import {getMetrics} from '../../common/utils/metrics';

import find_ from 'lodash/find';

import {
    getAccountsNS,
    getBundlesNS,
    getChytNS,
    getClusterNS,
    makeGetSetting,
} from '../../store/selectors/settings';
import {SettingName} from '../../../shared/constants/settings';
import {reloadSetting, setSetting} from '../../store/actions/settings';
import {getActiveAccount} from '../../store/selectors/accounts/accounts';
import {getTabletsActiveBundle} from '../selectors/tablet_cell_bundles';

const LAST_VISITED_BUFFER_SIZE = 15;

export function accountsTrackVisit(account) {
    return (dispatch, getState) => {
        const activeAccount = getActiveAccount(getState());
        if (account === activeAccount) {
            return;
        }

        const parentNS = getAccountsNS(getState());
        return dispatch(trackLastVisited(account, parentNS));
    };
}

export function navigationTrackVisit(path) {
    return (dispatch, getState) => {
        const parentNS = getClusterNS(getState());
        return dispatch(trackLastVisited(path, parentNS));
    };
}

export function bundlesTrackVisit(bundle) {
    return (dispatch, getState) => {
        const state = getState();
        const activeBundle = getTabletsActiveBundle(state);
        if (!bundle || bundle === activeBundle) {
            return;
        }
        const parentNS = getBundlesNS(state);
        return dispatch(trackLastVisited(bundle, parentNS));
    };
}

function trackLastVisited(value, parentNS, settingName = SettingName.LOCAL.LAST_VISITED) {
    return (dispatch, getState) => {
        return dispatch(reloadSetting(settingName, parentNS)).then(() => {
            const state = getState();
            const current = makeGetSetting(state)(settingName, parentNS) || [];
            const currentPathItem = {path: value, count: 1};

            return dispatch(
                setSetting(
                    settingName,
                    parentNS,
                    current
                        .reduce(
                            (updated, item) => {
                                if (item.path === value) {
                                    currentPathItem.count += item.count;
                                } else {
                                    updated.push(item);
                                }

                                return updated;
                            },
                            [currentPathItem],
                        )
                        .slice(0, LAST_VISITED_BUFFER_SIZE),
                ),
            );
        });
    };
}

export function accountsToggleFavourite(account) {
    getMetrics().countEvent('accounts_toggle-favourites');

    return (dispatch, getState) => {
        const parentNS = getAccountsNS(getState());
        return dispatch(toggleFavourite(account, parentNS));
    };
}

export function chytToggleFavourite(clique) {
    getMetrics().countEvent('chyt_toggle-favourites');

    return (dispatch, getState) => {
        const chytNS = getChytNS(getState());
        return dispatch(toggleFavourite(clique, chytNS));
    };
}

export function navigationToggleFavourite(path) {
    getMetrics().countEvent('navigation_toggle-favourites');

    return (dispatch, getState) => {
        const parentNS = getClusterNS(getState());
        return dispatch(toggleFavourite(path, parentNS));
    };
}

export function bundlesToggleFavourite(bundle) {
    getMetrics().countEvent('accounts_toggle-favourites');

    return (dispatch, getState) => {
        const parentNS = getBundlesNS(getState());
        return dispatch(toggleFavourite(bundle, parentNS));
    };
}

export function toggleFavourite(value, parentNS, settingName = SettingName.LOCAL.FAVOURITES) {
    return (dispatch, getState) => {
        return dispatch(reloadSetting(settingName, parentNS)).then(() => {
            const state = getState();
            const current = [...(makeGetSetting(state)(settingName, parentNS) || [])];
            const currentPathItem = {path: value};

            const entry = find_(current, currentPathItem);

            if (entry) {
                current.splice(current.indexOf(entry), 1);
            } else {
                current.push(currentPathItem);
            }

            return dispatch(setSetting(settingName, parentNS, current));
        });
    };
}
