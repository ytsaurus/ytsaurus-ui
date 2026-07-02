import React, {type FC, useCallback} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import StarIcon from '@gravity-ui/icons/svgs/star.svg';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import CopyIcon from '@gravity-ui/icons/svgs/copy.svg';
import './HeaderActions.scss';
import cn from 'bem-cn-lite';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {
    copyPathToClipboard,
    toggleFavoritePath,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {
    selectFavouritePaths,
    selectNavigationCluster,
    selectPathActionsNode,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {makeNavigationLink} from '../../../../utils/app-url';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {PathActionsMenu} from '../PathActionsMenu';
import {useToggle} from 'react-use';

const b = cn('navigation-header-actions');

export const HeaderActions: FC<{className?: string}> = ({className}) => {
    const dispatch = useDispatch();
    const pathActionsNode = useSelector(selectPathActionsNode);
    const cluster = useSelector(selectNavigationCluster);
    const favorites = useSelector(selectFavouritePaths);
    const engine = useSelector(selectQueryEngine);
    const [pathMenuOpen, togglePathMenuOpen] = useToggle(false);

    const {path} = pathActionsNode;
    const isFavorite = favorites.includes(path);
    const navigationUrl = makeNavigationLink({path, cluster});

    const handleFavoriteToggle = useCallback(() => {
        dispatch(toggleFavoritePath(path));
    }, [dispatch, path]);

    const handlePathCopy = useCallback(() => {
        dispatch(copyPathToClipboard(path));
    }, [dispatch, path]);

    if (!cluster) return null;

    return (
        <div className={b(null, className)}>
            <Button view="flat" href={navigationUrl} target="_blank">
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
            </Button>
            <Button view="flat" onClick={handleFavoriteToggle}>
                <Icon data={isFavorite ? StarFillIcon : StarIcon} size={16} />
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
