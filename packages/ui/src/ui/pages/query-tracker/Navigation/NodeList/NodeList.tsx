import React, {type FC, useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectIsQueryNavigationLoading,
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectNodeListByFilter,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {NodeListRow} from './NodeListRow';
import {
    copyPathToClipboard,
    loadNodeByPath,
    loadTableAttributesByPath,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {navigationToggleFavourite} from '../../../../store/actions/favourites';
import './NodeList.scss';
import cn from 'bem-cn-lite';
import {isFolderNode} from '../../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../../utils/navigation/isTableNode';
import {selectQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {getNavigationUrl} from '../helpers/getNavigationUrl';
import {ItemsList} from '../ItemsList';

const b = cn('navigation-node-list');

export const NodeList: FC = () => {
    const dispatch = useDispatch();
    const cluster = useSelector(selectNavigationCluster);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const nodes = useSelector(selectNodeListByFilter);
    const engine = useSelector(selectQueryEngine);
    const loading = useSelector(selectIsQueryNavigationLoading);

    const handleNodeClick = (path: string, type: string | undefined) => {
        if (isFolderNode(type)) {
            dispatch(loadNodeByPath(path));
            return;
        }
        if (isTableNode(type)) {
            dispatch(loadTableAttributesByPath(path));
            return;
        }
    };

    const handleFavoriteToggle = useCallback(
        (favoritePath: string) => {
            dispatch(navigationToggleFavourite(favoritePath, cluster));
        },
        [dispatch, cluster],
    );

    const onClipboardCopy = useCallback(
        (path: string) => {
            if (!clusterConfig || !clusterConfig.id) return;
            const pathString = getNavigationUrl(clusterConfig.id, path);
            dispatch(copyPathToClipboard(pathString));
        },
        [clusterConfig, dispatch],
    );

    const handleNewWindowOpen = useCallback(
        (path: string) => {
            if (!clusterConfig || !clusterConfig.id) return;
            const url = new URL(location.origin + `/${clusterConfig.id}/navigation`);
            url.searchParams.append('path', path);
            window.open(url);
        },
        [clusterConfig],
    );

    return (
        <div className={b()}>
            <ItemsList
                loading={loading}
                data={nodes}
                render={(node) => {
                    return (
                        <NodeListRow
                            key={node.path}
                            node={node}
                            engine={engine}
                            onClick={handleNodeClick}
                            onFavoriteToggle={handleFavoriteToggle}
                            onClipboardCopy={onClipboardCopy}
                            onNewWindowOpen={handleNewWindowOpen}
                        />
                    );
                }}
            />
        </div>
    );
};

export default NodeList;
