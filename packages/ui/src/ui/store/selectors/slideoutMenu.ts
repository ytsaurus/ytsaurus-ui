import _ from 'lodash';
import {createSelector} from 'reselect';
import {ClusterConfig} from '../../../shared/yt-types';
import {RootState} from '../reducers';
import {PAGE_ICONS_BY_ID} from '../../constants/slideoutMenu';
import {getSettingsPagesOrder, getSettingsPagesPinned} from './settings-ts';
import {getAllowedExperimentalPages, isDeveloper} from './global';
import UIFactory from '../../UIFactory';

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

export function getRecentClustersInfo(state: RootState): RecentClustersInfo {
    return state.slideoutMenu.clusters;
}

const getRecentPagesInfoRaw = createSelector(
    [(state: RootState) => state.slideoutMenu.pages, isDeveloper, getAllowedExperimentalPages],
    (pageInfoRaw, isAdmin, allowExpPages) => {
        const expPages = UIFactory.getExperimentalPages();
        const hiddenPages = new Set(
            expPages.filter((expPages) => {
                return !allowExpPages.includes(expPages);
            }),
        );

        return {
            ...pageInfoRaw,
            all:
                isAdmin || hiddenPages.size === 0
                    ? pageInfoRaw.all
                    : pageInfoRaw.all.filter((page) => !hiddenPages.has(page.id)),
        };
    },
);

const getRecentAllPagesInfoRaw = createSelector(
    [getRecentPagesInfoRaw],
    (pageInfo) => pageInfo.all,
);

export const getRecentPagesInfo = createSelector(
    [getRecentPagesInfoRaw],
    (items): RecentPagesInfo => {
        const {all, ...rest} = items;

        const res = {
            ...rest,
            all,
        };

        return res;
    },
);

export const getKnownPages = createSelector([getRecentAllPagesInfoRaw], (pages) => {
    return _.reduce(
        pages,
        (acc, page) => {
            acc[page.id] = page.name;
            return acc;
        },
        {} as Record<string, string>,
    );
});

export const getPagesInfoMapById = createSelector([getRecentPagesInfo], ({all}) => {
    const res = _.reduce(
        all,
        (acc, item) => {
            acc[item.id] = item;
            return acc;
        },
        {} as Record<string, PageInfo>,
    );
    return res;
});

export const getPagesOrderedByName = createSelector([getRecentPagesInfo], ({all}) => {
    return _.sortBy(
        all.filter((item) => Boolean(PAGE_ICONS_BY_ID[item.id])),
        'name',
    );
});

export const getPagesOrderedByUser = createSelector(
    [getPagesOrderedByName, getSettingsPagesOrder, getSettingsPagesPinned],
    (pages, order, pinned) => {
        const pagesById = _.reduce(
            pages,
            (acc, item) => {
                acc[item.id] = item;
                return acc;
            },
            {} as Record<string, PageInfo>,
        );

        const ordered: Array<PageInfo & {pinned?: boolean}> = _.compact(
            _.map(order, (item) => {
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

        _.forEach(pagesById, (item) => {
            ordered.push({
                ...item,
                pinned: pinned[item.id],
            });
        });

        const [pinnedItems, other] = _.partition(ordered, ({pinned}) => pinned);

        return pinnedItems.concat(other);
    },
);

export const getPagesOrderedByUserAndPinned = createSelector([getPagesOrderedByUser], (pages) => {
    return _.filter(pages, 'pinned');
});
