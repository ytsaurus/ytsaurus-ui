import {type RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {selectClusterList} from '../slideoutMenu';
import {BodyType, type NavigationNode} from '../../reducers/query-tracker/queryNavigationSlice';
import {selectGetSetting} from '../settings';
import {createNestedNS} from '../../../../shared/utils/settings';
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';

export const selectNavigationCluster = (state: RootState) =>
    state.queryTracker.queryNavigation.cluster;
export const selectIsQueryNavigationLoading = (state: RootState) =>
    state.queryTracker.queryNavigation.loading;
export const selectClusterConfigs = (state: RootState) => state.clustersMenu.clusters;
export const selectNavigationError = (state: RootState) => state.queryTracker.queryNavigation.error;

export const selectNavigationClusterConfig = createSelector(
    [selectNavigationCluster, selectClusterConfigs],
    (clusterName, clusters) => {
        if (!clusterName || !(clusterName in clusters)) return null;

        return clusters[clusterName];
    },
);

export const selectFavouritePaths = createSelector(
    [selectGetSetting, selectNavigationCluster],
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

export const selectPathTargetNode = (state: RootState) =>
    state.queryTracker.queryNavigation.pathTargetNode;

export const selectPathActionsNode = createSelector(
    [selectNavigationPath, selectNavigationNodes, selectPathTargetNode, selectNavigationNodeType],
    (path, nodes, pathTargetNode, bodyType): Pick<NavigationNode, 'path' | 'type' | 'dynamic'> => {
        const nodeFromList = nodes.find((node) => node.path === path);

        return {
            path,
            type:
                nodeFromList?.type ??
                pathTargetNode?.type ??
                (bodyType === BodyType.Table ? 'table' : undefined),
            dynamic: nodeFromList?.dynamic ?? pathTargetNode?.dynamic,
        };
    },
);

export const selectNavigationTable = (state: RootState) => state.queryTracker.queryNavigation.table;

const filterValueInText = (value: string, filter: string) =>
    value.toLowerCase().includes(filter.toLowerCase());

export const selectClustersByFilter: (state: RootState) => ReturnType<typeof selectClusterList> =
    createSelector([selectClusterList, selectNavigationFilter], (clusters, filter) => {
        if (!filter) return clusters;

        return clusters.filter(({name}) => filterValueInText(name, filter));
    });

export const selectNodeListByFilter = createSelector(
    [selectNavigationNodes, selectNavigationFilter, selectNavigationPath, selectFavouritePaths],
    (nodes, filter, path, favouritePaths) => {
        const isRoot = !path || path === '/';
        const parentPath = isRoot ? path : path.split('/').slice(0, -1).join('/');

        const favouritePathSet = new Set(favouritePaths);
        const nodesWithFavoriteState = nodes.map((node) => {
            const isFavorite = favouritePathSet.has(node.path);
            return node.isFavorite === isFavorite ? node : {...node, isFavorite};
        });

        const upItem: NavigationNode = {
            name: '...',
            type: 'map_node',
            path: parentPath,
            isFavorite: false,
        };

        if (!filter) return isRoot ? nodesWithFavoriteState : [upItem, ...nodesWithFavoriteState];

        const result = nodesWithFavoriteState.filter(({name}) => filterValueInText(name, filter));

        if (!isRoot) {
            result.unshift(upItem);
        }

        return result;
    },
);
