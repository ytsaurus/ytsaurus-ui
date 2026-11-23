import React, {useEffect, useState} from 'react';
import block from 'bem-cn-lite';
import {Avatar} from '@gravity-ui/uikit';
import {QueriesNavigation} from '@gravity-ui/querieskit/modules/QueriesNavigation';
import type {
    LoadPathSuggestions,
    NavigationLocation,
    NavigationSortOrder,
} from '@gravity-ui/querieskit';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectClustersByFilter,
    selectIsQueryNavigationLoading,
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectNavigationFilter,
    selectNavigationNodeType,
    selectNavigationPath,
    selectNodeListByFilter,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {
    initNavigation,
    loadPath,
    loadTableAttributesByPath,
    setNavigationCluster,
    showNavigationClusters,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {BodyType, setFilter} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {removeActiveRequests} from '../../../../store/actions/navigation/path-editor/path-editor';
import {loadSuggestions} from '../../../../utils/navigation/path-editor';
import {makeNavigationLink} from '../../../../utils/app-url';
import {getCssColor} from '../../../../utils/get-css-color';
import {getClusterAppearance} from '../../../../appearance';
import {MapNodeIcon} from '../../../../components/MapNodeIcon/MapNodeIcon';
import {HeaderActions} from '../../Navigation/NavigationHeader/HeaderActions';
import {NavigationError} from '../../Navigation/NavigationBody/NavigationError';
import {NavigationTable} from '../../Navigation/NavigationTable';
import {normalizePath} from '../../Navigation/helpers/normalizePath';
import {NavigationRow} from './NavigationRow/NavigationRow';
import {
    type NavigationTabItem,
    getNavigationItemRowConfig,
    toNavigationCluster,
    toNavigationItem,
    toPathSuggestion,
} from './adapters';

import './NavigationTab.scss';

const b = block('yt-querieskit-navigation-tab');

const loadPathSuggestions: LoadPathSuggestions = async ({path, cluster, customFilter}) => {
    const suggestions = (await loadSuggestions({path, cluster, customFilter: undefined})).map(
        toPathSuggestion,
    );
    return customFilter ? customFilter(suggestions) : suggestions;
};

export function NavigationTab() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectNavigationCluster);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const path = useSelector(selectNavigationPath);
    const nodeType = useSelector(selectNavigationNodeType);
    const loading = useSelector(selectIsQueryNavigationLoading);
    const filter = useSelector(selectNavigationFilter);
    const clusters = useSelector(selectClustersByFilter);
    const nodes = useSelector(selectNodeListByFilter);
    const [sort, setSort] = useState<NavigationSortOrder>('asc');

    useEffect(() => {
        dispatch(initNavigation());
        return () => {
            dispatch(removeActiveRequests());
        };
    }, [dispatch]);

    const handleNavigate = (next: NavigationLocation) => {
        if (!next.cluster) {
            dispatch(showNavigationClusters());
            return;
        }
        if (next.cluster !== cluster) {
            dispatch(setNavigationCluster(next.cluster));
            return;
        }
        const nextPath = normalizePath(next.path ?? '/');
        if (clusterConfig && nextPath !== path) {
            dispatch(loadPath(nextPath, clusterConfig));
        }
    };

    const items: NavigationTabItem[] = nodes
        .filter((node) => node.name !== '...')
        .map((node) => ({
            ...toNavigationItem(node),
            icon: <MapNodeIcon node={{$attributes: node}} />,
        }))
        .sort((a, z) => a.title.localeCompare(z.title) * (sort === 'asc' ? 1 : -1));

    const navigationClusters = clusters.map((item) => {
        const navigationCluster = toNavigationCluster(
            item,
            getCssColor(`--${item.theme}-color`, {allowUndefined: true}) ??
                getCssColor('--cluster-default-color'),
        );
        return {
            ...navigationCluster,
            icon: (
                <Avatar
                    className={b('cluster-icon')}
                    imgUrl={getClusterAppearance(item.id).icon2x}
                    alt={item.name}
                    shape="square"
                    size="2xs"
                    backgroundColor={navigationCluster.backgroundColor}
                    style={{borderColor: navigationCluster.backgroundColor}}
                />
            ),
        };
    });

    return (
        <div className={b()} data-qa="querieskit-navigation">
            <QueriesNavigation
                location={{cluster, path}}
                onUpdate={handleNavigate}
                clusters={navigationClusters}
                items={nodeType === BodyType.Tree ? items : []}
                search={{value: filter, onUpdate: (value) => dispatch(setFilter(value))}}
                sort={{value: sort, onUpdate: setSort}}
                parentRow={{showDuringSearch: true}}
                header={{
                    renderActions: () => <HeaderActions groupedPathActions />,
                    getBreadcrumbHref: (location) =>
                        makeNavigationLink({cluster: location.cluster, path: location.path ?? '/'}),
                    onLoadSuggestions: loadPathSuggestions,
                }}
                getItemRowConfig={getNavigationItemRowConfig}
                renderNavigationItem={({item, isParentRow}) => {
                    if (isParentRow) {
                        return undefined;
                    }
                    return <NavigationRow key={`${cluster}:${item.path}`} item={item} />;
                }}
                listState={{
                    loading,
                    error: nodeType === BodyType.Error ? <NavigationError /> : undefined,
                }}
                detail={{
                    openedItem:
                        nodeType === BodyType.Table
                            ? toNavigationItem({path, name: path, type: 'table', isFavorite: false})
                            : undefined,
                    onItemOpen: (item) => dispatch(loadTableAttributesByPath(item.path)),
                    // Keep the YT-specific table renderers, schema extensions and editor actions.
                    resolve: () => ({
                        tabs: [],
                        emptyContent: <NavigationTable key={`${cluster}:${path}`} />,
                    }),
                }}
            />
        </div>
    );
}
