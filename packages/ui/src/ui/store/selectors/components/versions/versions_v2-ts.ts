import {createSelector} from 'reselect';
import {RootState} from '../../../../store/reducers';
import {FIX_MY_TYPE, SortState} from '../../../../types';
import {sortArrayBySortState} from '../../../../utils/sort-helpers';
import {VersionSummaryItem} from '../../../../store/reducers/components/versions/versions_v2';
import {isSupportedClusterNodeForVersions} from '../../../../store/selectors/thor/support';

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
        return items;
    },
);

export const getVersionsSummaryVisibleColumns = createSelector(
    [getSummary, isSupportedClusterNodeForVersions],
    (summary = [], useClusterNode) => {
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

        tryToAdd('primary_master', 'Primary Masters', 'Pri Masters');
        tryToAdd('secondary_master', 'Secondary masters', 'Sec Masters');
        tryToAdd('scheduler', 'Schedulers');
        tryToAdd('controller_agent', 'Controller Agents', 'CA');
        tryToAdd(useClusterNode ? 'cluster_node' : 'node', 'Nodes');
        tryToAdd('http_proxy', 'HTTP Proxies');
        tryToAdd('rpc_proxy', 'RPC Proxies');
        tryToAdd('job_proxy', 'Job Proxies');
        tryToAdd('online', 'Online');
        tryToAdd('offline', 'Offline');
        tryToAdd('banned', 'Banned');

        return res;
    },
);

function getTotalElementOfSummary(summary: ReturnType<typeof getSummary>) {
    return summary[summary.length - 1];
}
