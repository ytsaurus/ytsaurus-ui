import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {FIX_MY_TYPE, SortState} from '../../../../types';
import {sortArrayBySortState} from '../../../../utils/sort-helpers';
import {VersionSummaryItem} from '../../../../store/reducers/components/versions/versions_v2';
import format from '../.../../../../../common/hammer/format';

export const getSummarySortState = (
    state: RootState,
): undefined | SortState<keyof VersionSummaryItem> =>
    (state.components.versionsV2 as FIX_MY_TYPE).summarySortState;

const getSummary = (state: RootState): Array<VersionSummaryItem> =>
    state.components.versionsV2.summary;

export const getHideOfflineValue = (state: RootState): boolean =>
    state.components.versionsV2.checkedHideOffline;

export const getVersionsSummaryVisibleRows = createSelector([getSummary], (summary = []) => {
    const visibleTypes = new Set<string>();
    const total = getTotalElementOfSummary(summary);
    Object.keys(total ?? {}).forEach((k) => {
        const key = k as keyof typeof total;
        if (total?.[key]) {
            visibleTypes.add(key);
        }
    });

    const res: Array<{type: keyof VersionSummaryItem; name: string; shortName: string}> = [];
    function tryToAdd(type: keyof VersionSummaryItem, name: string, shortName = '') {
        if (visibleTypes.has(type)) {
            res.push({type, name, shortName});
        }
    }

    for (const key in summary[summary.length - 1]) {
        if (['online', 'offline', 'banned', 'version'].includes(key)) continue;
        tryToAdd(key, format.Readable(key));
    }

    tryToAdd('online', 'Online');
    tryToAdd('offline', 'Offline');
    tryToAdd('banned', 'Banned');

    return res;
});

export const getVersionsSummaryData = createSelector(
    [getSummary, getSummarySortState, getHideOfflineValue],
    (summary = [], sortState) => {
        const error = summary[summary.length - 2];
        const total = getTotalElementOfSummary(summary);
        let items = summary.slice(0, summary.length - 2);

        items = sortArrayBySortState(items, sortState);

        if (error) {
            items.splice(0, 0, error);
        }
        if (total) {
            items.push(total);
        }

        let newItems = [];
        for (const item of items) {
            const version = item.version;
            let res = {};
            let temp = {}
            for (let key in item) {
                if (key === 'verion') continue;
                // @ts-ignore
                temp[key] = item[key];
            }
            // @ts-ignore
            res[version] = temp;
            newItems.push(res);
        }
        return newItems;
    },
);

function getTotalElementOfSummary(summary: ReturnType<typeof getSummary>) {
    return summary[summary.length - 1];
}

export const getVersions = createSelector([getSummary], (summary = []) => {
    const versions = []; 
    for (const item of summary) {
        versions.push(({
            type: item.version,
            name: item.version,
        }));
    }
    return versions;
});
