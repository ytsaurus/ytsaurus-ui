import {type RootState} from '../../../store/reducers';
import {createSelector} from 'reselect';
import {PAGE_SIZE} from '../../reducers/accounts/usage/accounts-usage-filters';
import ypath from '../../../common/thor/ypath';

import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {type SortState} from '../../../types';
import {
    selectSettingsAccountUsageColumnsList,
    selectSettingsAccountUsageColumnsListFolders,
    selectSettingsAccountUsageColumnsTree,
} from '../../../store/selectors/settings/settings-ts';
import format from '../../../common/hammer/format';
import {type AccountUsageDataItem} from '../../../store/reducers/accounts/usage/account-usage-types';

const ACCOUNT_USAGE_COLUMN_TITLE: Record<string, string> = {
    approximate_row_count: '~Row count',
    master_memory: 'Master mem',
};

const MEDIUM_PREFIX = 'medium:';

export function readableAccountUsageColumnName(column: string, withMediumPrefix?: boolean) {
    const title = ACCOUNT_USAGE_COLUMN_TITLE[column];
    if (title) {
        return title;
    }

    const readable =
        !withMediumPrefix && column.startsWith(MEDIUM_PREFIX)
            ? column.substr(MEDIUM_PREFIX.length)
            : column;
    return format.Readable(readable);
}

export const selectAccountUsageSnapshots = (state: RootState) =>
    state.accounts.usage.snapshots.snapshot_timestamps;

export const selectAccountUsageCurrentSnapshot = (state: RootState) =>
    state.accounts.usage.filters.currentSnapshot;

export const selectAccountUsageTreePath = (state: RootState) =>
    state.accounts.usage.filters.treePath;

export const selectAccountUsageSortState = (state: RootState) =>
    state.accounts.usage.filters.sortState;

export const selectAccountUsageViewType = (state: RootState) =>
    state.accounts.usage.filters.viewType;

export const selectAccountUsagePathFilter = (state: RootState) =>
    state.accounts.usage.filters.pathFilter;

export const selectAccountUsageOwnerFilter = (state: RootState) =>
    state.accounts.usage.filters.ownerFilter;

export const selectAccountUsageDateRangeFilter = (state: RootState) =>
    state.accounts.usage.filters.dateRange;

export const selectAccountUsageDateRangeTypeFilter = (state: RootState) =>
    state.accounts.usage.filters.dateRangeType;

export const selectAccountsUsageDiffFromSnapshot = (state: RootState) =>
    state.accounts.usage.filters.diffFromSnapshot;

export const selectAccountsUsageDiffToSnapshot = (state: RootState) =>
    state.accounts.usage.filters.diffToSnapshot;

const selectAccountUsagePageIndexRaw = (state: RootState) => state.accounts.usage.filters.pageIndex;

export const selectAccountUsageListRequestParams = (state: RootState) =>
    state.accounts.usage.list.requestParams;

export const selectAccountUsageListLoading = (state: RootState) =>
    state.accounts.usage.list.loading;

export const selectAccountUsageListLoaded = (state: RootState) => state.accounts.usage.list.loaded;

export const selectAccountUsageListError = (state: RootState) => state.accounts.usage.list.error;

export const selectAccountUsageListItems = (state: RootState) =>
    state.accounts.usage.list.response?.items || [];

export const selectAccountUsageListFields = (state: RootState) =>
    state.accounts.usage.list.response?.fields || [];

export const selectAccountUsageListMediums = (state: RootState) =>
    state.accounts.usage.list.response?.mediums || [];

export const selectAccountUsageListRowCount = (state: RootState) =>
    state.accounts.usage.list.response?.row_count || 0;

export const selectAccountUsageTreeRequestParams = (state: RootState) =>
    state.accounts.usage.tree.requestParams;

export const selectAccountUsageTreeLoading = (state: RootState) =>
    state.accounts.usage.tree.loading;

export const selectAccountUsageTreeLoaded = (state: RootState) => state.accounts.usage.tree.loaded;

export const selectAccountUsageTreeError = (state: RootState) => state.accounts.usage.tree.error;

export const selectAccountUsageTreeItems = (state: RootState) =>
    state.accounts.usage.tree.response?.items || [];

export const selectAccountUsageTreeFields = (state: RootState) =>
    state.accounts.usage.tree.response?.fields || [];

export const selectAccountUsageTreeMediums = (state: RootState) =>
    state.accounts.usage.tree.response?.mediums || [];

export const selectAccountUsageTreeRowCount = (state: RootState) =>
    state.accounts.usage.tree.response?.row_count || 0;

export const selectAccountUsageTreeItemsBasePath = (state: RootState) =>
    state.accounts.usage.tree.base_path;

export const selectAccountUsageListDiffRequestParams = (state: RootState) =>
    state.accounts.usage.listDiff.requestParams;

export const selectAccountUsageListDiffLoading = (state: RootState) =>
    state.accounts.usage.listDiff.loading;

export const selectAccountUsageListDiffLoaded = (state: RootState) =>
    state.accounts.usage.listDiff.loaded;

export const selectAccountUsageListDiffError = (state: RootState) =>
    state.accounts.usage.listDiff.error;

export const selectAccountUsageListDiffItems = (state: RootState) =>
    state.accounts.usage.listDiff.response?.items || [];

export const selectAccountUsageListDiffFields = (state: RootState) =>
    state.accounts.usage.listDiff.response?.fields || [];

export const selectAccountUsageListDiffMediums = (state: RootState) =>
    state.accounts.usage.listDiff.response?.mediums || [];

export const selectAccountUsageListDiffRowCount = (state: RootState) =>
    state.accounts.usage.listDiff.response?.row_count || 0;

export const selectAccountUsageTreeDiffRequestParams = (state: RootState) =>
    state.accounts.usage.treeDiff.requestParams;

export const selectAccountUsageTreeDiffLoading = (state: RootState) =>
    state.accounts.usage.treeDiff.loading;

export const selectAccountUsageTreeDiffLoaded = (state: RootState) =>
    state.accounts.usage.treeDiff.loaded;

export const selectAccountUsageTreeDiffError = (state: RootState) =>
    state.accounts.usage.treeDiff.error;

export const selectAccountUsageTreeDiffItems = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.items || [];

export const selectAccountUsageTreeDiffFields = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.fields || [];

export const selectAccountUsageTreeDiffMediums = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.mediums || [];

export const selectAccountUsageTreeDiffRowCount = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.row_count || 0;

export const selectAccountUsageTreeDiffItemsBasePath = (state: RootState) =>
    state.accounts.usage.treeDiff.base_path;

export const selectIsAccountsUsageDiffView = createSelector(
    [selectAccountUsageViewType],
    (viewType) => {
        return viewType?.endsWith('-diff');
    },
);

export const selectAccountUsageTreeItemsBasePathSplitted = createSelector(
    [
        selectAccountUsageViewType,
        selectAccountUsageTreeItemsBasePath,
        selectAccountUsageTreeDiffItemsBasePath,
    ],
    (viewType, treePath, treeDiffPath) => {
        const path = viewType === 'tree-diff' ? treeDiffPath : treePath;
        if (!path) {
            return [];
        }

        const fragments: Array<{name: string}> = new ypath.YPath(path, 'absolute').fragments || [];

        return map_(fragments, (item, index) => {
            return {
                value: fragments
                    .slice(0, index + 1)
                    .map(({name}) => name)
                    .join('/'),
                item: item.name,
            };
        });
    },
);

export const selectAccountUsageFieldFiltersRequestParameter = createSelector(
    [selectAccountUsageDateRangeFilter, selectAccountUsageDateRangeTypeFilter],
    ({from, to}, dateRangeType: 'creation_time' | 'modification_time') => {
        const res = [];

        if (from !== null) {
            res.push({
                field: dateRangeType,
                value: Math.round(new Date(from).getTime() / 1000),
                comparison: '>=' as const,
            });
        }

        if (to !== null) {
            res.push({
                field: dateRangeType,
                value: Math.round(new Date(to).getTime() / 1000),
                comparison: '<=' as const,
            });
        }

        return res;
    },
);

export const selectAccountUsagePageCount = createSelector(
    [
        selectAccountUsageViewType,
        selectAccountUsageListRowCount,
        selectAccountUsageTreeRowCount,
        selectAccountUsageListDiffRowCount,
    ],
    (viewType, listRowCount, treeRowCount, listDiffRowCount) => {
        let rowCount = listRowCount;
        if (viewType === 'tree') {
            rowCount = treeRowCount;
        } else if (viewType === 'list-diff' || viewType === 'list-plus-folders-diff') {
            rowCount = listDiffRowCount;
        }
        return rowCount > 0 ? Math.ceil(rowCount / PAGE_SIZE) : 0;
    },
);

export const selectAccountUsagePageIndex = createSelector(
    [selectAccountUsagePageIndexRaw],
    (pageIndex) => {
        return Math.max(0, Number(pageIndex));
    },
);

export const selectAccountUsageSortStateByColumn = createSelector(
    [selectAccountUsageSortState],
    (sortState) => {
        return reduce_(
            sortState,
            (acc, {column, order}, index) => {
                if (column && order) {
                    acc[column] = {
                        order,
                        multisortIndex: sortState.length > 1 ? index + 1 : undefined,
                    };
                }
                return acc;
            },
            {} as Record<string, {order: Required<SortState>['order']; multisortIndex?: number}>,
        );
    },
);

export const selectAccountUsageAvailableColumns = createSelector(
    [
        selectAccountUsageViewType,
        selectAccountUsageListFields,
        selectAccountUsageTreeFields,
        selectAccountUsageListDiffFields,
        selectAccountUsageTreeDiffFields,
    ],
    (viewType, listFields, treeFields, listDiffFields, treeDiffFields) => {
        switch (viewType) {
            case 'list':
            case 'list-plus-folders':
                return listFields;
            case 'list-diff':
            case 'list-plus-folders-diff':
                return listDiffFields;
            case 'tree':
                return treeFields;
            case 'tree-diff':
                return treeDiffFields;
        }
        return [];
    },
);

const defaultTreeColumns: Array<keyof AccountUsageDataItem> = [
    'owner',
    'disk_space',
    'medium:default',
    'medium:ssd_blobs',
    'medium:nvme_blobs',
    'chunk_count',
    'node_count',
    'modification_time',
] as any;

const defaultListColumns: Array<keyof AccountUsageDataItem> = [
    'owner',
    'disk_space',
    'medium:default',
    'medium:ssd_blobs',
    'medium:nvme_blobs',
    'chunk_count',
    'modification_time',
] as any;

const defaultListFoldersColumns: Array<keyof AccountUsageDataItem> = [
    'owner',
    'disk_space',
    'medium:default',
    'medium:ssd_blobs',
    'medium:nvme_blobs',
    'chunk_count',
    'node_count',
    'modification_time',
] as any;

function firstNotEmpty<T = keyof AccountUsageDataItem>(a1: Array<T>, a2: Array<T>): Array<T> {
    if (a1?.length) {
        return a1;
    }

    return a2;
}

const selectAccountUsageVisibleColumns = createSelector(
    [
        selectAccountUsageViewType,
        selectSettingsAccountUsageColumnsTree,
        selectSettingsAccountUsageColumnsList,
        selectSettingsAccountUsageColumnsListFolders,
    ],
    (viewType, treeColumns, listColumns, listFoldersColumns) => {
        switch (viewType) {
            case 'list':
            case 'list-diff':
                return firstNotEmpty(listColumns, defaultListColumns);
            case 'list-plus-folders':
            case 'list-plus-folders-diff':
                return firstNotEmpty(listFoldersColumns, defaultListFoldersColumns);
            default:
                return firstNotEmpty(treeColumns, defaultTreeColumns);
        }
    },
);

export const selectAccountUsageSelectableColumns = createSelector(
    [selectAccountUsageAvailableColumns],
    (columns) => {
        return filter_(columns, (item) => !ACCOUNT_USAGE_UNAVAILABLE_FIELDS.has(item));
    },
);

export const ACCOUNT_USAGE_UNAVAILABLE_FIELDS = new Set([
    'type',
    'path',
    'depth',
    'account',
    'medium:cache',
    'direct_child_count',
]);

export const selectAccountUsageVisibleDataColumns = createSelector(
    [selectAccountUsageSelectableColumns, selectAccountUsageVisibleColumns],
    (selectableColumns, userColumns) => {
        const columns = new Set<string>(selectableColumns);

        return ['type', 'path'].concat(
            filter_(userColumns, (item) => {
                return columns.has(item);
            }),
        );
    },
);
