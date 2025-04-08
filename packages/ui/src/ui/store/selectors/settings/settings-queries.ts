import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';
import {getCluster} from '../global';

export const getQuerySuggestionsEnabled = createSelector(getSettingsData, (data) => {
    return data['global::queryTracker::suggestions'] || false;
});

export const getFavoriteQueryEngine = createSelector(
    [getSettingsData, getCluster],
    (data, cluster) => {
        return data[`local::${cluster}::queryTracker::favoriteEngine`];
    },
);

export const getFavoriteQueryPath = createSelector(
    [getSettingsData, getCluster],
    (data, cluster) => {
        return data[`local::${cluster}::queryTracker::favoritePath`];
    },
);

export const getFavoriteQueryClique = createSelector(
    [getSettingsData, getCluster],
    (data, cluster) => {
        return data[`local::${cluster}::queryTracker::favoriteClique`];
    },
);

export const getFavoriteQuerySettings = createSelector(
    [getFavoriteQueryEngine, getFavoriteQueryPath, getFavoriteQueryClique],
    (engine, path, clique) => {
        return {
            engine,
            path,
            clique,
        };
    },
);
