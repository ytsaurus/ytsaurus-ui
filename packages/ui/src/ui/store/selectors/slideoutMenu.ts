import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import partition_ from 'lodash/partition';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';

import {createSelector} from 'reselect';
import {type ClusterConfig} from '../../../shared/yt-types';
import {type RootState} from '../reducers';
import {PAGE_ICONS_BY_ID} from '../../constants/slideoutMenu';

import {
    selectSettingsPagesOrder,
    selectSettingsPagesPinned,
} from '../../store/selectors/settings/settings-ts';
import {selectClusterUiConfig} from '../../store/selectors/global';
import {selectIsAdmin} from '../../store/selectors/global/is-developer';
import {selectAllowedExperimentalPages} from '../../store/selectors/global/experimental-pages';

import UIFactory from '../../UIFactory';
import {Page} from '../../../shared/constants/settings';

interface RecentInfo<T> {
    all: Array<T>;
    recent: Array<T>;
    rest: Array<T>;
}

type RecentClustersInfo = RecentInfo<ClusterConfig>;

export interface PageInfo {
    id: string;
    name: string;
    header?: boolean;
}

type RecentPagesInfo = RecentInfo<PageInfo>;

export function selectRecentClustersInfo(state: RootState): RecentClustersInfo {
    return state.slideoutMenu.clusters;
}

const selectRecentPagesInfoRaw = createSelector(
    [
        (state: RootState) => state.slideoutMenu.pages,
        selectIsAdmin,
        selectAllowedExperimentalPages,
        selectClusterUiConfig,
    ],
    (pageInfoRaw, isAdmin, allowExpPages, uiConfig) => {
        const expPages = UIFactory.getExperimentalPages();
        const hiddenPages = new Set(
            expPages.filter((expPages) => {
                return !allowExpPages?.includes(expPages);
            }),
        );

        const allowChyt = Boolean(uiConfig.chyt_controller_base_url);

        const allPages = pageInfoRaw.all.filter((page) => {
            if (page.id === Page.CHYT) {
                return allowChyt;
            }
            return true;
        });

        return {
            ...pageInfoRaw,
            all:
                isAdmin || hiddenPages.size === 0
                    ? allPages
                    : allPages.filter((page) => !hiddenPages.has(page.id)),
        };
    },
);

export const selectClusterList = createSelector([selectRecentClustersInfo], (recentInfo) => {
    const {recent, rest} = recentInfo;
    return [...recent, ...rest];
});

const selectRecentAllPagesInfoRaw = createSelector(
    [selectRecentPagesInfoRaw],
    (pageInfo) => pageInfo.all,
);

export const selectRecentPagesInfo = createSelector(
    [selectRecentPagesInfoRaw],
    (items): RecentPagesInfo => {
        const {all, ...rest} = items;

        const res = {
            ...rest,
            all,
        };

        return res;
    },
);

export const selectKnownPages = createSelector([selectRecentAllPagesInfoRaw], (pages) => {
    return reduce_(
        pages,
        (acc, page) => {
            acc[page.id] = page.name;
            return acc;
        },
        {} as Record<string, string>,
    );
});

export const selectPagesInfoMapById = createSelector([selectRecentPagesInfo], ({all}) => {
    const res = reduce_(
        all,
        (acc, item) => {
            acc[item.id] = item;
            return acc;
        },
        {} as Record<string, PageInfo>,
    );
    return res;
});

export const selectPagesOrderedByName = createSelector([selectRecentPagesInfo], ({all}) => {
    return sortBy_(
        all.filter((item) => Boolean(PAGE_ICONS_BY_ID[item.id])),
        'name',
    );
});

export const selectPagesOrderedByUser = createSelector(
    [selectPagesOrderedByName, selectSettingsPagesOrder, selectSettingsPagesPinned],
    (pages, order, pinned) => {
        const pagesById = reduce_(
            pages,
            (acc, item) => {
                acc[item.id] = item;
                return acc;
            },
            {} as Record<string, PageInfo>,
        );

        const ordered: Array<PageInfo & {pinned?: boolean}> = compact_(
            map_(order, (item) => {
                const res = pagesById[item];
                delete pagesById[item];
                return res
                    ? {
                          ...res,
                          pinned: pinned[res.id],
                      }
                    : false;
            }),
        );

        forEach_(pagesById, (item) => {
            ordered.push({
                ...item,
                pinned: pinned[item.id],
            });
        });

        const [pinnedItems, other] = partition_(ordered, ({pinned}) => pinned);

        return pinnedItems.concat(other);
    },
);

export const selectPagesOrderedByUserAndPinned = createSelector(
    [selectPagesOrderedByUser],
    (pages) => {
        return filter_(pages, 'pinned');
    },
);
