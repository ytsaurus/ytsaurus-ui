import React from 'react';
import {DropdownMenu, Flex} from '@gravity-ui/uikit';
import type {NavigationNode} from '@ytsaurus/components';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectNavigationCluster} from '../../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryEngine} from '../../../../../store/selectors/query-tracker/query';
import {navigationToggleFavourite} from '../../../../../store/actions/favourites';
import {copyPathToClipboard} from '../../../../../store/actions/query-tracker/queryNavigation';
import {makeNavigationLink} from '../../../../../utils/app-url';
import {PathActionsMenu} from '../../../Navigation/PathActionsMenu';
import {getNavigationUrl} from '../../../Navigation/helpers/getNavigationUrl';
import i18n from '../../../Navigation/NodeList/NodeListRow/i18n';
import actionsI18n from './i18n';

export type NavigationItemMenu = 'path' | 'actions';

type Props = {
    node: NavigationNode;
    openMenu: NavigationItemMenu | undefined;
    onOpenChange: (menu: NavigationItemMenu, open: boolean) => void;
};

export function NavigationItemActions({node, openMenu, onOpenChange}: Props) {
    const dispatch = useDispatch();
    const cluster = useSelector(selectNavigationCluster);
    const engine = useSelector(selectQueryEngine);

    return (
        <Flex gap={1}>
            <PathActionsMenu
                grouped
                node={node}
                engine={engine}
                open={openMenu === 'path'}
                onOpenToggle={() => onOpenChange('path', openMenu !== 'path')}
            />
            <DropdownMenu
                open={openMenu === 'actions'}
                onOpenToggle={(next: React.SetStateAction<boolean>) =>
                    onOpenChange(
                        'actions',
                        typeof next === 'function' ? next(openMenu === 'actions') : next,
                    )
                }
                items={[
                    {
                        text: actionsI18n(
                            node.isFavorite
                                ? 'action_remove-from-favourites'
                                : 'action_add-to-favourites',
                        ),
                        action: () => dispatch(navigationToggleFavourite(node.path, cluster)),
                    },
                    {
                        text: i18n('action_copy-link'),
                        action: () => {
                            if (cluster) {
                                dispatch(copyPathToClipboard(getNavigationUrl(cluster, node.path)));
                            }
                        },
                    },
                    {
                        text: i18n('action_open-in-cluster'),
                        href: makeNavigationLink({cluster, path: node.path}),
                        target: '_blank',
                    },
                ]}
            />
        </Flex>
    );
}
