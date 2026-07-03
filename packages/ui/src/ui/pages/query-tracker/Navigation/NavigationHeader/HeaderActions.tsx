import React, {type FC, useCallback} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import CopyIcon from '@gravity-ui/icons/svgs/copy.svg';
import './HeaderActions.scss';
import cn from 'bem-cn-lite';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {
    copyPathToClipboard,
    loadPath,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectPathActionsNode,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {makeNavigationLink} from '../../../../utils/app-url';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {PathActionsMenu} from '../PathActionsMenu';
import {useToggle} from 'react-use';
import {NavigationFavorites} from '../../../../containers/NavigationFavorites';
import {type FavouritesItem} from '../../../../components/Favourites/Favourites';

const b = cn('navigation-header-actions');

export const HeaderActions: FC<{className?: string}> = ({className}) => {
    const dispatch = useDispatch();
    const pathActionsNode = useSelector(selectPathActionsNode);
    const cluster = useSelector(selectNavigationCluster);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const engine = useSelector(selectQueryEngine);
    const [pathMenuOpen, togglePathMenuOpen] = useToggle(false);

    const {path} = pathActionsNode;
    const navigationUrl = makeNavigationLink({path, cluster});

    const handlePathCopy = useCallback(() => {
        dispatch(copyPathToClipboard(path));
    }, [dispatch, path]);

    const handleFavoriteItemClick = useCallback(
        ({path: favoritePath}: FavouritesItem) => {
            if (!clusterConfig) return;

            dispatch(loadPath(favoritePath, clusterConfig));
        },
        [clusterConfig, dispatch],
    );

    if (!cluster) return null;

    return (
        <div className={b(null, className)}>
            <NavigationFavorites
                path={path}
                cluster={cluster}
                onItemClick={handleFavoriteItemClick}
            />
            <Button view="flat" href={navigationUrl} target="_blank">
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
            </Button>
            <PathActionsMenu
                node={pathActionsNode}
                open={pathMenuOpen}
                onOpenToggle={togglePathMenuOpen}
                engine={engine}
            />
            <Button view="flat" onClick={handlePathCopy}>
                <Icon data={CopyIcon} size={16} />
            </Button>
        </div>
    );
};
