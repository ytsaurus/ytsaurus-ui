import moment from 'moment';

import {SPLIT_MENU_ITEMS, JOIN_MENU_ITEMS} from '../../constants/index';
import {updateTitle, mergeScreen} from '../../store/actions/global';
import {setSetting} from '../../store/actions/settings';
import {
    getRecentClustersInfo,
    getRecentPagesInfo,
    getKnownPages,
} from '../../store/selectors/slideoutMenu';
import metrics from '../../common/utils/metrics';
import {SettingName, NAMESPACES} from '../../../shared/constants/settings';
import {getLastVisitedTabs, getClusterNS} from '../../store/selectors/settings';
import {getPath} from '../../../shared/utils/settings';
import {getCluster, getCurrentUserName} from '../../store/selectors/global';

function getNSName(itemName) {
    return {
        cluster: NAMESPACES.LAST_VISITED_CLUSTER,
        page: NAMESPACES.LAST_VISITED_PAGE,
    }[itemName];
}

function getLastVisitedSettingName(itemName, id) {
    const nsName = getNSName(itemName);
    return getPath(id, nsName);
}

export function splitMenuItemsAction(itemName) {
    const collectionName = itemName + 's';
    return (dispatch, getState) => {
        const state = getState();
        const clusters = getRecentClustersInfo(state);
        const pages = getRecentPagesInfo(state);
        const {
            settings: {data},
        } = getState();
        dispatch({
            type: SPLIT_MENU_ITEMS,
            data: {
                collectionName,
                items: collectionName === 'pages' ? pages.all : clusters.all,
                getLastVisitedSetting: (item) => getLastVisitedSettingName(itemName, item.id),
                settings: data,
                currentTime: moment().unix(),
            },
        });
    };
}

export function joinMenuItemsAction(collectionName) {
    return {
        type: JOIN_MENU_ITEMS,
        data: collectionName,
    };
}

export function trackVisit(itemName, id) {
    return (dispatch) => {
        const ns = getNSName(itemName);
        const currentTime = moment().unix();

        dispatch(setSetting(id, ns, currentTime));
        dispatch(splitMenuItemsAction(itemName));
    };
}

export function trackPageVisit(page) {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const login = getCurrentUserName(state);
        const known = getKnownPages(state);
        dispatch(trackVisit('page', page));
        dispatch(updateTitle({page: known[page]}));

        dispatch(mergeScreen());

        window.setTimeout(() => {
            metrics.countHit({page, cluster, login});
        }, 200);
    };
}

export function trackTabVisit(page, tab) {
    return (dispatch, getState) => {
        const state = getState();
        const clusterNS = getClusterNS(state);
        const lastVisitedTabs = getLastVisitedTabs(state);
        const newLastVisitedTabs = {...lastVisitedTabs, [page]: tab};

        dispatch(setSetting(SettingName.LOCAL.LAST_VISITED_TAB, clusterNS, newLastVisitedTabs));

        // add metrics there
    };
}
