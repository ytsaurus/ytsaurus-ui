import React, {FC, useCallback} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import StarIcon from '@gravity-ui/icons/svgs/star.svg';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
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
    selectNavigationPath,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {getQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {makePathByQueryEngine} from '../helpers/makePathByQueryEngine';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {useMonaco} from '../../hooks/useMonaco';
import {makeNavigationLink} from '../../../../utils/app-url';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

const b = cn('navigation-header-actions');

export const HeaderActions: FC = () => {
    const dispatch = useDispatch();
    const path = useSelector(selectNavigationPath);
    const cluster = useSelector(selectNavigationCluster);
    const favorites = useSelector(selectFavouritePaths);
    const engine = useSelector(getQueryEngine);
    const {getEditor} = useMonaco();

    const isFavorite = favorites.includes(path);
    const navigationUrl = makeNavigationLink({path, cluster});

    const handleFavoriteToggle = useCallback(() => {
        dispatch(toggleFavoritePath(path));
    }, [dispatch, path]);

    const handlePathCopy = useCallback(() => {
        dispatch(copyPathToClipboard(path));
    }, [dispatch, path]);

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

    if (!cluster) return null;

    return (
        <div className={b()}>
            <Button view="flat" href={navigationUrl} target="_blank">
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
            </Button>
            <Button view="flat" onClick={handleFavoriteToggle}>
                <Icon data={isFavorite ? StarFillIcon : StarIcon} size={16} />
            </Button>
            <Button view="flat" onClick={handlePastePath}>
                <Icon data={TextIndentIcon} size={16} />
            </Button>
            <Button view="flat" onClick={handlePathCopy}>
                <Icon data={CopyIcon} size={16} />
            </Button>
        </div>
    );
};
