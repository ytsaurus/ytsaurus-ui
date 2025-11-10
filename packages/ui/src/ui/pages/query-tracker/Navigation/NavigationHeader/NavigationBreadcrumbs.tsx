import React, {FC, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Icon} from '@gravity-ui/uikit';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import {BreadcrumbsItem as BreadcrumbsItemComponent} from './BreadcrumbsItem';
import {Breadcrumbs, BreadcrumbsItem} from '../../../../components/Breadcrumbs';
import {
    selectNavigationCluster,
    selectNavigationPath,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {
    BodyType,
    setCluster,
    setNodeType,
    setPath,
} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {loadNodeByPath} from '../../../../store/actions/query-tracker/queryNavigation';

export const NavigationBreadcrumbs: FC = () => {
    const dispatch = useDispatch();
    const path = useSelector(selectNavigationPath);
    const cluster = useSelector(selectNavigationCluster);

    const handleClusterChangeClick = useCallback(() => {
        dispatch(setNodeType(BodyType.Cluster));
        dispatch(setCluster(undefined));
        dispatch(setPath(''));
    }, [dispatch]);

    const handleBreadcrumbsClick = useCallback(
        (newPath: string) => {
            dispatch(loadNodeByPath(newPath));
        },
        [dispatch],
    );

    const items = useMemo(() => {
        if (!cluster) return [];

        let href = '/';
        const result = [{text: cluster, href: '/'}];
        path.split('/').forEach((text) => {
            if (text) {
                href += '/' + text;
                result.push({
                    text,
                    href,
                });
            }
        });

        return result.map((item, index) => {
            const isCurrent = index === result.length - 1;
            return (
                <BreadcrumbsItem key={item.text}>
                    <BreadcrumbsItemComponent
                        item={item}
                        isCurrent={isCurrent}
                        onClick={handleBreadcrumbsClick}
                    />
                </BreadcrumbsItem>
            );
        });
    }, [cluster, path, handleBreadcrumbsClick]);

    return (
        <>
            <Button size="s" view="flat" onClick={handleClusterChangeClick}>
                <Icon data={FolderTreeIcon} size={16} />
            </Button>
            <Breadcrumbs showRoot>{items}</Breadcrumbs>
        </>
    );
};
