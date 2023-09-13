import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {FIX_MY_TYPE, SortState} from '../../../../types';
import {sortArrayBySortState} from '../../../../utils/sort-helpers';
import {VersionSummaryItem} from '../../../../store/reducers/components/versions/versions_v2';

export const getSummarySortState = (
    state: RootState,
): undefined | SortState<keyof VersionSummaryItem> =>
    (state.components.versionsV2 as FIX_MY_TYPE).summarySortState;

const getSummary = (state: RootState): Array<VersionSummaryItem> =>
    state.components.versionsV2.summary;

export const getHideOfflineValue = (state: RootState): boolean =>
    state.components.versionsV2.checkedHideOffline;

export const getVersionsSummaryData = createSelector(
    [getSummary, getSummarySortState, getHideOfflineValue],
    (summary = [], sortState, checkedHideOffline) => {
        const error = summary[summary.length - 2];
        const total = summary[summary.length - 1];
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
        return items;
    },
);
