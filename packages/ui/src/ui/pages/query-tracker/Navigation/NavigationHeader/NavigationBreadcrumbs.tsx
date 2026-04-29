import React, {type FC, type FocusEvent, useCallback, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Breadcrumbs, Button, Flex, Icon} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import {
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectNavigationPath,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {
    BodyType,
    setCluster,
    setNodeType,
    setPath,
} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {loadNodeByPath, loadPath} from '../../../../store/actions/query-tracker/queryNavigation';
import {EditableBreadcrumbs} from '../../../../components/EditableBreadcrumbs/EditableBreadcrumbs';
import PathEditor from '../../../../containers/PathEditor/PathEditor';
import {normalizePath} from '../helpers/normalizePath';
import {Page} from '../../../../constants';
import {makeRoutedURL} from '../../../../store/location';
import {Tab} from '../../../../constants/navigation';

import './NavigationBreadcrumbs.scss';

const b = cn('navigation-header-breadcrumbs');

export const NavigationBreadcrumbs: FC = () => {
    const dispatch = useDispatch();
    const path = useSelector(selectNavigationPath);
    const cluster = useSelector(selectNavigationCluster);
    const clusterConfig = useSelector(selectNavigationClusterConfig);

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

    const handleApplyPath = useCallback(
        (newPath: string) => {
            if (!clusterConfig) {
                return;
            }

            const normalizedNewPath = normalizePath(newPath);

            if (normalizedNewPath === path) {
                return;
            }

            dispatch(loadPath(normalizedNewPath, clusterConfig));
        },
        [clusterConfig, dispatch, path],
    );

    const handlePathEditorFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
        event.target?.select();
    }, []);

    const items = useMemo(() => {
        if (!cluster) return [];

        let navPath = '/';
        const url = `/${cluster}/${Page.NAVIGATION}`;
        const result = [
            {
                text: cluster,
                path: navPath,
                href: makeRoutedURL(url, {
                    path: '',
                    navmode: Tab.CONTENT,
                    filter: '',
                }),
            },
        ];
        path.split('/').forEach((text) => {
            if (text) {
                navPath += '/' + text;
                result.push({
                    text,
                    path: navPath,
                    href: makeRoutedURL(url, {
                        path: navPath,
                        navmode: Tab.CONTENT,
                        filter: '',
                    }),
                });
            }
        });

        return result.map((item, index) => {
            const isCurrent = index === result.length - 1;
            return (
                <Breadcrumbs.Item
                    key={item.path}
                    href={item.href}
                    onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                            e.preventDefault();
                            if (!isCurrent) {
                                handleBreadcrumbsClick(item.path);
                            }
                        }
                    }}
                >
                    {item.text}
                </Breadcrumbs.Item>
            );
        });
    }, [cluster, path, handleBreadcrumbsClick]);

    return (
        <>
            <Button view="flat" onClick={handleClusterChangeClick}>
                <Icon data={FolderTreeIcon} size={16} />
            </Button>
            {items.length > 0 ? (
                <EditableBreadcrumbs
                    className={b()}
                    showRoot
                    renderEditor={(props) => (
                        <Flex gap={1}>
                            <Breadcrumbs className={b()} showRoot>
                                {items[0]}
                            </Breadcrumbs>
                            <PathEditor
                                autoFocus
                                className={b('path-editor', props.className)}
                                cluster={cluster}
                                defaultPath={!path || path === '/' ? '//' : path}
                                onApply={handleApplyPath}
                                onBlur={props.onBlur}
                                onCancel={props.onBlur}
                                onFocus={handlePathEditorFocus}
                            />
                        </Flex>
                    )}
                >
                    {items}
                </EditableBreadcrumbs>
            ) : null}
        </>
    );
};
