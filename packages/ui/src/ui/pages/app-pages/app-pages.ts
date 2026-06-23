import {registerPageIcon} from '../../constants/slideoutMenu';
import {type UIFactoryClusterPageInfo} from '../../UIFactory';

// TODO: use { Page } from constants/index.js
import {Page} from '../../constants';
import i18n from './i18n';

export interface HeaderItem {
    id: string;
    name: string;
    header?: boolean;
    hidden?: boolean;
}

export const APP_PAGES: Array<HeaderItem> = [
    {
        id: Page.NAVIGATION,
        get name() {
            return i18n('title_navigation');
        },
        header: true,
    },
    {
        id: Page.FLOWS,
        get name() {
            return i18n('title_flow-pipelines');
        },
        hidden: true,
    },
    {
        id: Page.OPERATIONS,
        get name() {
            return i18n('title_operations');
        },
        header: true,
    },
    {
        id: Page.SCHEDULING,
        get name() {
            return i18n('title_scheduling');
        },
    },
    {
        id: Page.COMPONENTS,
        get name() {
            return i18n('title_components');
        },
    },
    {
        id: Page.DASHBOARD,
        get name() {
            return i18n('title_dashboard');
        },
        header: true,
    },
    {
        id: Page.ACCOUNTS,
        get name() {
            return i18n('title_accounts');
        },
    },
    {
        id: Page.TABLET_CELL_BUNDLES,
        get name() {
            return i18n('title_bundles');
        },
    },
    {
        id: Page.GROUPS,
        get name() {
            return i18n('title_groups');
        },
    },
    {
        id: Page.USERS,
        get name() {
            return i18n('title_users');
        },
    },
    {
        id: Page.PATH_VIEWER,
        get name() {
            return i18n('title_path-viewer');
        },
    },
    {
        id: Page.JOB,
        get name() {
            return i18n('title_job');
        },
        hidden: true,
    },
    {
        id: Page.TABLET,
        get name() {
            return i18n('title_tablet');
        },
        hidden: true,
    },
    {
        id: Page.BAN,
        get name() {
            return i18n('title_banned');
        },
        hidden: true,
    },
    {
        id: Page.SYSTEM,
        get name() {
            return i18n('title_system');
        },
        header: true,
    },
    {
        id: Page.VERSIONS,
        get name() {
            return i18n('title_versions');
        },
    },
    {
        id: Page.QUERIES,
        get name() {
            return i18n('title_queries');
        },
    },
    {
        id: Page.CHYT,
        get name() {
            return i18n('title_cliques');
        },
    },
];

export function registerExtraPage(item: UIFactoryClusterPageInfo) {
    const {pageId, title, svgIcon} = item;
    const page = APP_PAGES.find(({id}) => id === pageId);
    if (page) {
        throw new Error(`Cannot register an item with duplicated pageId: ${pageId}`);
    }
    const res = {id: pageId, name: title};
    copyDescriptor(item, 'title', res, 'name');
    APP_PAGES.push(res);

    if (svgIcon) {
        registerPageIcon(pageId, svgIcon);
    }
}

function copyDescriptor<
    SrcT extends object,
    SrcK extends keyof SrcT,
    DstT extends Record<DstK, SrcT[SrcK]>,
    DstK extends string,
>(src: SrcT, srcKey: SrcK, dst: DstT, dstKey: DstK) {
    const descriptor = Object.getOwnPropertyDescriptor(src, srcKey);
    Object.defineProperty(dst, dstKey, descriptor!);
}
