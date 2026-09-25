import React, {useMemo, useState} from 'react';
import cn from 'bem-cn-lite';
import {
    type LoadPathSuggestions,
    type NavigationCluster,
    type NavigationItem,
    type NavigationItemKind,
    NavigationItemRow,
    type NavigationLocation,
    type NavigationSortOrder,
    QueriesNavigation,
} from '@gravity-ui/querieskit';
import {type NavigationNode} from '@ytsaurus/components';

import {type ClusterConfig} from '../../../../../shared/yt-types';
import {Page} from '../../../../constants';
import {Tab} from '../../../../constants/navigation';
import {NavigationError} from '../NavigationBody/NavigationError';
import {NavigationTable} from '../NavigationTable';
import {HeaderActions} from '../NavigationHeader/HeaderActions';
import {NodeListRow} from '../NodeList/NodeListRow/NodeListRow';
import {normalizePath} from '../helpers/normalizePath';
import {getNavigationUrl} from '../helpers/getNavigationUrl';
import {QueryClusterItem} from '../../QueryTrackerTopRow/QueryClusterSelector/QueryClusterItem';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    copyPathToClipboard,
    loadPath,
    loadTableAttributesByPath,
    setNavigationCluster,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {navigationToggleFavourite} from '../../../../store/actions/favourites';
import {
    BodyType,
    setCluster,
    setFilter,
    setNodeType,
    setPath,
} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {
    selectClusterConfigs,
    selectClustersByFilter,
    selectFilteredNavigationNodes,
    selectIsQueryNavigationLoading,
    selectNavigationCluster,
    selectNavigationError,
    selectNavigationFilter,
    selectNavigationNodeType,
    selectNavigationPath,
    selectNavigationTable,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {isFolderNode} from '../../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../../utils/navigation/isTableNode';
import {loadSuggestions} from '../../../../utils/navigation/path-editor';
import {makeRoutedURL} from '../../../../store/location';

const block = cn('query-navigation');
const clusterListBlock = cn('navigation-cluster-list');

type QueriesNavigationCluster = NavigationCluster & {
    config: ClusterConfig;
};

type QueriesNavigationItem = NavigationItem & {
    node?: NavigationNode;
};

type PathSuggestion = {
    parentPath: string;
    childPath: string;
    path: string;
    type?: string;
    targetPathBroken?: boolean;
};

function getNavigationItemKind(type?: string): NavigationItemKind {
    if (isFolderNode(type)) return type === 'link' ? 'link' : 'folder';
    if (isTableNode(type)) return 'table';
    if (type === 'file') return 'file';
    return 'unknown';
}

function prepareNavigationItem(node: NavigationNode): QueriesNavigationItem {
    const hasChildren = isFolderNode(node.type);
    const supported = hasChildren || isTableNode(node.type);

    return {
        path: node.path,
        title: node.name,
        kind: getNavigationItemKind(node.type),
        targetPathBroken: node.broken,
        hasChildren,
        disabled: !supported,
        node,
    };
}

function getBreadcrumbHref({cluster, path}: NavigationLocation) {
    if (!cluster) return undefined;

    return makeRoutedURL(`/${cluster}/${Page.NAVIGATION}`, {
        path: path ? normalizePath(path) : '',
        navmode: Tab.CONTENT,
        filter: '',
    });
}

const loadPathSuggestions: LoadPathSuggestions = async (params) => {
    const suggestions = (await loadSuggestions(params)) as PathSuggestion[];

    return suggestions.map(({type, ...suggestion}) => ({
        ...suggestion,
        kind: getNavigationItemKind(type),
    }));
};

export function QueriesNavigationAdapter() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectNavigationCluster);
    const clusterConfigs = useSelector(selectClusterConfigs);
    const path = useSelector(selectNavigationPath);
    const filter = useSelector(selectNavigationFilter);
    const nodes = useSelector(selectFilteredNavigationNodes);
    const clusters = useSelector(selectClustersByFilter);
    const nodeType = useSelector(selectNavigationNodeType);
    const loading = useSelector(selectIsQueryNavigationLoading);
    const error = useSelector(selectNavigationError);
    const table = useSelector(selectNavigationTable);
    const engine = useSelector(selectQueryEngine);
    const [sort, setSort] = useState<NavigationSortOrder>('asc');

    const navigationClusters = useMemo<QueriesNavigationCluster[]>(
        () =>
            clusters.map((config) => ({
                id: config.id,
                title: config.name,
                description: config.environment,
                config,
            })),
        [clusters],
    );

    const navigationItems = useMemo<QueriesNavigationItem[]>(() => {
        const prepared = nodes.map(prepareNavigationItem);
        prepared.sort((lhs, rhs) => lhs.title.localeCompare(rhs.title));
        return sort === 'asc' ? prepared : prepared.reverse();
    }, [nodes, sort]);

    const openedItem = useMemo<QueriesNavigationItem | undefined>(() => {
        if (nodeType !== BodyType.Table) return undefined;

        return (
            navigationItems.find((item) => item.path === path) ?? {
                path,
                title: table?.name ?? path.split('/').filter(Boolean).at(-1) ?? path,
                kind: 'table',
            }
        );
    }, [navigationItems, nodeType, path, table?.name]);

    const handleUpdate = (nextLocation: NavigationLocation) => {
        const nextCluster = nextLocation.cluster;

        if (!nextCluster) {
            dispatch(setNodeType(BodyType.Cluster));
            dispatch(setCluster(undefined));
            dispatch(setPath(''));
            return;
        }

        if (nextCluster !== cluster) {
            dispatch(setNavigationCluster(nextCluster));
            return;
        }

        const clusterConfig = clusterConfigs[nextCluster];
        const nextPath = normalizePath(nextLocation.path ?? '/');
        if (!clusterConfig || nextPath === path) return;

        dispatch(loadPath(nextPath, clusterConfig));
    };

    const handleFavoriteToggle = (favoritePath: string) => {
        dispatch(navigationToggleFavourite(favoritePath, cluster));
    };

    const handleClipboardCopy = (nodePath: string) => {
        if (!cluster) return;
        dispatch(copyPathToClipboard(getNavigationUrl(cluster, nodePath)));
    };

    const handleNewWindowOpen = (nodePath: string) => {
        if (!cluster) return;
        const url = new URL(location.origin + `/${cluster}/navigation`);
        url.searchParams.append('path', nodePath);
        window.open(url);
    };

    const handleItemOpen = (item: QueriesNavigationItem) => {
        dispatch(loadTableAttributesByPath(item.path));
    };

    return (
        <QueriesNavigation<QueriesNavigationItem, QueriesNavigationCluster>
            className={block()}
            location={{cluster, path}}
            onUpdate={handleUpdate}
            clusters={navigationClusters}
            items={navigationItems}
            header={{
                getBreadcrumbHref,
                onLoadSuggestions: loadPathSuggestions,
                renderActions: () => <HeaderActions />,
            }}
            search={{
                value: filter,
                onUpdate: (value) => dispatch(setFilter(value)),
            }}
            sort={{value: sort, onUpdate: setSort}}
            listState={{
                loading: loading || nodeType === BodyType.Loading,
                error: nodeType === BodyType.Error && error ? <NavigationError /> : undefined,
            }}
            parentRow={{showDuringSearch: true}}
            detail={{
                openedItem,
                onItemOpen: handleItemOpen,
                resolve: () => ({tabs: [], emptyContent: <NavigationTable />}),
            }}
            renderClusterItem={({cluster: item}) => (
                <QueryClusterItem
                    id={item.config.id}
                    name={item.config.name}
                    environment={item.config.environment}
                    className={clusterListBlock('item')}
                />
            )}
            renderNavigationItem={({item, isParentRow}) => {
                if (isParentRow || !item.node) {
                    return <NavigationItemRow item={item} />;
                }

                return (
                    <NodeListRow
                        node={item.node}
                        engine={engine}
                        onFavoriteToggle={handleFavoriteToggle}
                        onClipboardCopy={handleClipboardCopy}
                        onNewWindowOpen={handleNewWindowOpen}
                    />
                );
            }}
        />
    );
}
