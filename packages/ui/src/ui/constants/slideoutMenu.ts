import accountsIcon from '../assets/img/svg/page-accounts.svg';
import componentIcon from '../assets/img/svg/page-components.svg';
import dashboardIcon from '../assets/img/svg/page-dashboard.svg';
import groupsIcon from '../assets/img/svg/page-groups.svg';
import navigationIcon from '../assets/img/svg/page-navigation.svg';
import pipelineIcon from '../assets/img/svg/icons/node-pipeline.svg';
import operationsIcon from '../assets/img/svg/page-operations.svg';
import pathViewerIcon from '../assets/img/svg/page-path-viewer.svg';
import schedulingIcon from '../assets/img/svg/page-scheduling.svg';
import systemIcon from '../assets/img/svg/page-system.svg';
import tabletCellBundlesIcon from '../assets/img/svg/page-tablet-cell-bundles.svg';
import usersIcon from '../assets/img/svg/page-users.svg';
import versionsIcon from '../assets/img/svg/page-versions.svg';
import pageNoIcon from '../assets/img/svg/page-no-icon.svg';
import pageQueries from '../assets/img/svg/page-query-tracker.svg';
import pageChyt from '../assets/img/svg/page-chyt.svg';

import {Page} from './index';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

export const PAGES_WITH_ICONS = [
    {id: Page.ACCOUNTS, icon: accountsIcon},
    {id: Page.COMPONENTS, icon: componentIcon},
    {id: Page.DASHBOARD, icon: dashboardIcon},
    {id: Page.GROUPS, icon: groupsIcon},
    {id: Page.NAVIGATION, icon: navigationIcon},
    {id: Page.FLOW, icon: pipelineIcon},
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

export const PAGE_ICONS_BY_ID = PAGES_WITH_ICONS.reduce(
    (acc, {id, icon}) => {
        acc[id] = icon;
        return acc;
    },
    {} as Record<string, any>,
);

export const emptyPageIcon = pageNoIcon;

export function registerPageIcon(pageId: string, svgIcon: SVGIconData) {
    if (PAGE_ICONS_BY_ID[pageId]) {
        throw new Error(`Icon for page '${pageId}' already registered`);
    }

    PAGE_ICONS_BY_ID[pageId] = svgIcon;
}
