import React, {FC, useCallback} from 'react';
import cn from 'bem-cn-lite';
import './NavigationHeader.scss';
import {NavigationBreadcrumbs} from './NavigationBreadcrumbs';
import {HeaderActions} from './HeaderActions';
import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectFavouritePaths,
    selectNavigationCluster,
    selectNavigationFilter,
    selectNavigationNodeType,
    selectNavigationPath,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {
    BodyType,
    setCluster,
    setFilter,
    setNodeType,
    setPath,
} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {
    copyPathToClipboard,
    loadNodeByPath,
    toggleFavoritePath,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {makePathByQueryEngine} from '../helpers/makePathByQueryEngine';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {getQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {useMonaco} from '../../hooks/useMonaco';
import {makeRoutedURL} from '../../../../store/location';
import {Page} from '../../../../../shared/constants/settings';

const b = cn('navigation-header');

export const NavigationHeader: FC = () => {
    const dispatch = useDispatch();
    const favorites = useSelector(selectFavouritePaths);
    const filter = useSelector(selectNavigationFilter);
    const path = useSelector(selectNavigationPath);
    const engine = useSelector(getQueryEngine);
    const cluster = useSelector(selectNavigationCluster);
    const nodeType = useSelector(selectNavigationNodeType);
    const {getEditor} = useMonaco();

    const showFilter = nodeType !== BodyType.Table;

    const handleFilterChange = (value: string) => {
        dispatch(setFilter(value));
    };

    const handleChangeCluster = () => {
        dispatch(setNodeType(BodyType.Cluster));
        dispatch(setCluster(undefined));
        dispatch(setPath(''));
    };

    const handleChangePath = (val: string) => {
        dispatch(loadNodeByPath(val));
    };

    const handleFavoriteToggle = () => {
        dispatch(toggleFavoritePath(path));
    };

    const handlePathCopy = async () => {
        dispatch(copyPathToClipboard(path));
    };

    const handlePastePath = useCallback(() => {
        if (!cluster) return;
        const editor = getEditor('queryEditor');
        const pathString = makePathByQueryEngine({
            cluster,
            path,
            engine,
        });
        insertTextWhereCursor(pathString, editor);
    }, [cluster, engine, getEditor, path]);

    return (
        <div className={b()}>
            <div className={b('path-wrap')}>
                <NavigationBreadcrumbs
                    path={path}
                    cluster={cluster}
                    onClusterChangeClick={handleChangeCluster}
                    onItemClick={handleChangePath}
                />
                {cluster && (
                    <HeaderActions
                        isFavorite={favorites.includes(path)}
                        navigationUrl={makeRoutedURL(`/${cluster}/${Page.NAVIGATION}`, {path})}
                        onFavoriteToggle={handleFavoriteToggle}
                        onPathCopy={handlePathCopy}
                        onPastePath={handlePastePath}
                        showCopyBtn={Boolean(cluster)}
                    />
                )}
            </div>
            {showFilter && (
                <TextInput
                    value={filter}
                    placeholder="Filter by name"
                    onUpdate={handleFilterChange}
                    hasClear
                />
            )}
        </div>
    );
};
