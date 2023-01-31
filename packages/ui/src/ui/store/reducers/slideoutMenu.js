import _ from 'lodash';
import hammer from '../../common/hammer';
import {SPLIT_MENU_ITEMS, JOIN_MENU_ITEMS} from '../../constants';
import pages from '../../pages';

function prepareClusters(clustersObj) {
    const sortByClusterName = (clusterA, clusterB) => {
        return clusterA.name > clusterB.name ? 1 : -1;
    };
    const clusters = hammer.utils.objectToArray(clustersObj, 'id');
    clusters.sort(sortByClusterName);
    return clusters;
}

export const initialState = {
    pages: {
        all: pages,
        recent: [],
        rest: [],
    },
    clusters: {
        all: prepareClusters(window.YT.clusters),
        recent: [],
        rest: [],
    },
};

function resetRecentItems(state, collectionName) {
    const {...other} = state[collectionName];
    return {[collectionName]: {recent: [], rest: [], ...other}};
}

function splitRecentItems(
    state,
    {collectionName, items, getLastVisitedSetting, currentTime, settings},
) {
    const {...other} = state[collectionName];
    const recent = [];
    const rest = [];
    const TWO_WEEKS = 2 * 7 * 24 * 60 * 60;

    _.each(items, (item) => {
        const lastVisited = settings[getLastVisitedSetting(item)] || 0;

        // To hide menu title if all the pages are hidden
        if (!item.hidden) {
            if (currentTime - lastVisited <= TWO_WEEKS) {
                recent.push(item);
            } else {
                rest.push(item);
            }
        }
    });
    return {[collectionName]: {...other, recent, rest}};
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SPLIT_MENU_ITEMS:
            return {...state, ...splitRecentItems(state, action.data)};

        case JOIN_MENU_ITEMS:
            return {...state, ...resetRecentItems(state, action.data)};

        default:
            return state;
    }
};
