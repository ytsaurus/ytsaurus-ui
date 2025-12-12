import {registerPageIcon} from './constants/slideoutMenu';
import {UIFactoryClusterPageInfo} from './UIFactory';

// TODO: use { Page } from constants/index.js
import {Page} from './constants';

export interface HeaderItem {
    id: string;
    name: string;
    header?: boolean;
    hidden?: boolean;
}

const pages: Array<HeaderItem> = [
    {
        id: Page.NAVIGATION,
        name: 'Navigation',
        header: true,
    },
    {
        id: Page.FLOW,
        name: 'Flow',
        header: true,
    },
    {
        id: Page.OPERATIONS,
        name: 'Operations',
        header: true,
    },
    {
        id: Page.SCHEDULING,
        name: 'Scheduling',
    },
    {
        id: Page.COMPONENTS,
        name: 'Components',
    },
    {
        id: Page.DASHBOARD,
        name: 'Dashboard',
        header: true,
    },
    {
        id: Page.ACCOUNTS,
        name: 'Accounts',
    },
    {
        id: Page.TABLET_CELL_BUNDLES,
        name: 'Bundles',
    },
    {
        id: Page.GROUPS,
        name: 'Groups',
    },
    {
        id: Page.USERS,
        name: 'Users',
    },
    {
        id: Page.PATH_VIEWER,
        name: 'Path Viewer',
    },
    {
        id: Page.JOB,
        name: 'Job',
        hidden: true,
    },
    {
        id: Page.TABLET,
        name: 'Tablet',
        hidden: true,
    },
    {
        id: Page.BAN,
        name: 'Banned',
        hidden: true,
    },
    {
        id: Page.SYSTEM,
        name: 'System',
        header: true,
    },
    {
        id: Page.VERSIONS,
        name: 'Versions',
    },
    {
        id: Page.QUERIES,
        name: 'Queries',
    },
    {
        id: Page.CHYT,
        name: 'Cliques',
    },
];

export function registerExtraPage({pageId, title, svgIcon}: UIFactoryClusterPageInfo) {
    const page = pages.find(({id}) => id === pageId);
    if (page) {
        throw new Error(`Cannot register an item with duplicated pageId: ${pageId}`);
    }
    pages.push({id: pageId, name: title});

    if (svgIcon) {
        registerPageIcon(pageId, svgIcon);
    }
}

export default pages;
