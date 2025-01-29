import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {FIX_MY_TYPE, SortState} from '../../../../types';
import {sortArrayBySortState} from '../../../../utils/sort-helpers';
import {
    VersionSummaryItem,
    VersionSummaryRow,
} from '../../../../store/reducers/components/versions/versions_v2';

export const getSummarySortState = (
    state: RootState,
): undefined | SortState<keyof VersionSummaryItem> =>
    (state.components.versionsV2 as FIX_MY_TYPE).summarySortState;

const getSummary = (state: RootState): Array<VersionSummaryItem> =>
    state.components.versionsV2.summary;

export const getHideOfflineValue = (state: RootState): boolean =>
    state.components.versionsV2.checkedHideOffline;

function getTotalElementOfSummary(summary: ReturnType<typeof getSummary>) {
    return summary[summary.length - 1];
}

export const getVisibleSummaryItems = createSelector(
    [getSummary, getHideOfflineValue],
    (summary = [], checkedHideOffline) => {
        let items = summary;
        if (checkedHideOffline) {
            items = items.filter((item) => item && item.online !== undefined);
        }
        return items;
    },
);

export const getVersions = createSelector([getVisibleSummaryItems], (summary = []) => {
    const versions = [];
    for (const item of summary) {
        if (item) {
            versions.push({
                type: item.version,
                name: item.version,
            });
        }
    }
    return versions;
});

export const getVersionsSummaryData = createSelector(
    [getSummary, getSummarySortState, getHideOfflineValue],
    (summary = [], sortState, checkedHideOffline) => {
        const error = summary[summary.length - 2];
        const total = getTotalElementOfSummary(summary);
        let items = summary.slice(0, summary.length - 2);

        if (checkedHideOffline) {
            items = items.filter((item) => item.online !== undefined);
        }

        items = sortArrayBySortState(items, sortState);

        if (error) {
            items.splice(0, 0, error);
        }
        if (total) {
            items.push(total);
        }

        const components = new Set<string>();
        for (const item of items) {
            for (const key in item) {
                if (key) components.add(key);
            }
        }

        const res: VersionSummaryRow[] = [];
        // iterating over every type of components
        for (const component of Array.from(components)) {
            if (component === 'version') continue;
            // initializing table row object to avoid type errors
            const row: VersionSummaryRow = {type: component, total: 0};
            // iterating over array of objects with attribute 'version'
            for (const item of items) {
                // apply version of component to the some type in resulting object
                //                 type  item['version']: item[component] -> amount of components
                // example: res = {banned: {'2.12.123.1': 3, ...}}
                row[item['version']] = item[component];
            }
            // attribute 'type' will be the name of the row
            row['type'] = component;
            res.push(row);
        }

        return res;
    },
);
