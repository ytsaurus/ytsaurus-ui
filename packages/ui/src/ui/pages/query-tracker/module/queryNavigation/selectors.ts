import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {getClusterList} from '../../../../store/selectors/slideoutMenu';
import {NavigationNode} from './queryNavigationSlice';
import {makeGetSetting} from '../../../../store/selectors/settings';
import {createNestedNS} from '../../../../../shared/utils/settings';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';

export const selectNavigationCluster = (state: RootState) =>
    state.queryTracker.queryNavigation.cluster;

export const selectClusterConfigs = (state: RootState) => state.clustersMenu.clusters;

export const selectNavigationClusterConfig = createSelector(
    [selectNavigationCluster, selectClusterConfigs],
    (clusterName, clusters) => {
        if (!clusterName || !(clusterName in clusters)) return null;

        return clusters[clusterName];
    },
);

export const selectFavouritePaths = createSelector(
    [makeGetSetting, selectNavigationCluster],
    (getSetting, cluster) => {
        if (!cluster) return [];
        const parentNS = createNestedNS(cluster, NAMESPACES.LOCAL);
        const favourites = getSetting(SettingName.LOCAL.FAVOURITES, parentNS);

        return favourites ? favourites.map((i: {path: string}) => i.path).sort() : [];
    },
);

export const selectNavigationPath = (state: RootState) => state.queryTracker.queryNavigation.path;

export const selectNavigationNodeType = (state: RootState) =>
    state.queryTracker.queryNavigation.nodeType;

export const selectNavigationFilter = (state: RootState) =>
    state.queryTracker.queryNavigation.filter;

export const selectNavigationNodes = (state: RootState) => state.queryTracker.queryNavigation.nodes;

export const selectNavigationTable = (state: RootState) => state.queryTracker.queryNavigation.table;

const filterValueInText = (value: string, filter: string) =>
    value.toLowerCase().includes(filter.toLowerCase());

export const selectTableWithFilter = createSelector(
    [selectNavigationTable, selectNavigationFilter],
    (table, filter) => {
        if (!table) return null;

        return {
            ...table,
            schema: table.schema.filter(({name, type}) => {
                return filterValueInText(name, filter) || filterValueInText(type, filter);
            }),
        };
    },
);

export const selectClustersByFilter = createSelector(
    [getClusterList, selectNavigationFilter],
    (clusters, filter) => {
        if (!filter) return clusters;

        return clusters.filter(({name}) => filterValueInText(name, filter));
    },
);

export const selectNodeListByFilter = createSelector(
    [selectNavigationNodes, selectNavigationFilter, selectNavigationPath],
    (nodes, filter, path) => {
        const isRoot = !path || path === '/';
        const parentPath = isRoot ? path : path.split('/').slice(0, -1).join('/');
        const upItem: NavigationNode = {
            name: '...',
            type: 'map_node',
            path: parentPath,
            isFavorite: false,
        };

        if (!filter) return isRoot ? nodes : [upItem, ...nodes];

        const result = nodes.filter(({name}) => filterValueInText(name, filter));

        if (!isRoot) {
            result.unshift(upItem);
        }

        return result;
    },
);
