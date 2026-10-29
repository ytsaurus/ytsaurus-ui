import React from 'react';
import {DropdownMenu, Flex, Icon} from '@gravity-ui/uikit';
import type {NavigationHeaderConfig} from '@gravity-ui/querieskit';
import CopyIcon from '@gravity-ui/icons/svgs/copy.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    copyPathToClipboard,
    loadPath,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {
    selectNavigationCluster,
    selectNavigationClusterConfig,
    selectPathActionsNode,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {makeNavigationLink} from '../../../../utils/app-url';
import {NavigationFavorites} from '../../../../containers/NavigationFavorites';
import type {useNavigationMenuActions} from './useNavigationMenuActions';
import i18n from './i18n';
import rowI18n from '../NodeList/NodeListRow/i18n';
import pathI18n from '../PathActionsMenu/i18n';

export function useNavigationHeader(
    getMenuActions: ReturnType<typeof useNavigationMenuActions>['getMenuActions'],
): Pick<NavigationHeaderConfig, 'actions' | 'renderMenuTrigger'> {
    const dispatch = useDispatch();
    const node = useSelector(selectPathActionsNode);
    const cluster = useSelector(selectNavigationCluster);
    const clusterConfig = useSelector(selectNavigationClusterConfig);

    return {
        actions: [
            {
                id: 'open',
                title: rowI18n('action_open-in-cluster'),
                content: <Icon data={ArrowUpRightFromSquareIcon} size={16} />,
                hidden: !cluster,
                onClick: () =>
                    window.open(
                        makeNavigationLink({path: node.path, cluster}),
                        '_blank',
                        'noopener',
                    ),
            },
            {
                id: 'copy',
                title: pathI18n('action_copy-to-clipboard'),
                content: <Icon data={CopyIcon} size={16} />,
                hidden: !cluster,
                onClick: () => dispatch(copyPathToClipboard(node.path)),
            },
        ],
        renderMenuTrigger: () =>
            cluster ? (
                <Flex alignItems="center" gap={1}>
                    <NavigationFavorites
                        path={node.path}
                        cluster={cluster}
                        onItemClick={({path}) => {
                            if (clusterConfig) dispatch(loadPath(path, clusterConfig));
                        }}
                    />
                    <DropdownMenu
                        size="s"
                        defaultSwitcherProps={{'aria-label': i18n('action_node-actions')}}
                        items={getMenuActions(node)
                            .filter(({hidden}) => !hidden)
                            .map((action) => ({
                                text: action.title,
                                disabled: action.disabled,
                                action: () => action.onClick(undefined),
                            }))}
                    />
                </Flex>
            ) : null,
    };
}
