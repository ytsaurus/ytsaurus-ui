import accountsIcon from '../../../img/svg/page-accounts.svg';
import componentIcon from '../../../img/svg/page-components.svg';
import dashboardIcon from '../../../img/svg/page-dashboard.svg';
import groupsIcon from '../../../img/svg/page-groups.svg';
import navigationIcon from '../../../img/svg/page-navigation.svg';
import operationsIcon from '../../../img/svg/page-operations.svg';
import pathViewerIcon from '../../../img/svg/page-path-viewer.svg';
import schedulingIcon from '../../../img/svg/page-scheduling.svg';
import systemIcon from '../../../img/svg/page-system.svg';
import tabletCellBundlesIcon from '../../../img/svg/page-tablet-cell-bundles.svg';
import usersIcon from '../../../img/svg/page-users.svg';
import versionsIcon from '../../../img/svg/page-versions.svg';
import pageNoIcon from '../../../img/svg/page-no-icon.svg';
import pageQueries from '../../../img/svg/page-query-tracker.svg';
import pageChyt from '../../../img/svg/page-chyt.svg';

import {Page} from './index';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

export const PAGES_WITH_ICONS = [
    {id: Page.ACCOUNTS, icon: accountsIcon},
    {id: Page.COMPONENTS, icon: componentIcon},
    {id: Page.DASHBOARD, icon: dashboardIcon},
    {id: Page.GROUPS, icon: groupsIcon},
    {id: Page.NAVIGATION, icon: navigationIcon},
    {id: Page.OPERATIONS, icon: operationsIcon},
    {id: Page.PATH_VIEWER, icon: pathViewerIcon},
    {id: Page.SCHEDULING, icon: schedulingIcon},
    {id: Page.SYSTEM, icon: systemIcon},
    {id: Page.TABLET_CELL_BUNDLES, icon: tabletCellBundlesIcon},
    {id: Page.CHAOS_CELL_BUNDLES, icon: tabletCellBundlesIcon},
    {id: Page.USERS, icon: usersIcon},
    {id: Page.VERSIONS, icon: versionsIcon},
    {id: Page.QUERIES, icon: pageQueries},
    {id: Page.CHYT, icon: pageChyt},
];

export const PAGE_ICONS_BY_ID = PAGES_WITH_ICONS.reduce((acc, {id, icon}) => {
    acc[id] = icon;
    return acc;
}, {} as Record<string, any>);

export const emptyPageIcon = pageNoIcon;

export function registerPageIcon(pageId: string, svgIcon: SVGIconData) {
    if (PAGE_ICONS_BY_ID[pageId]) {
        throw new Error(`Icon for page '${pageId}' already registered`);
    }

    PAGE_ICONS_BY_ID[pageId] = svgIcon;
}
