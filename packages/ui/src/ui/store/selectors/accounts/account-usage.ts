import {RootState} from '../../../store/reducers';
import {createSelector} from 'reselect';
import {PAGE_SIZE} from '../../reducers/accounts/usage/accounts-usage-filters';
import ypath from '../../../common/thor/ypath';
import _ from 'lodash';
import {SortState} from '../../../types';
import {
    getSettingsAccountUsageColumnsList,
    getSettingsAccountUsageColumnsListFolders,
    getSettingsAccountUsageColumnsTree,
} from '../settings-ts';
import format from '../../../common/hammer/format';
import {AccountUsageDataItem} from '../../reducers/accounts/usage/account-usage-types';

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

export const getAccountUsageSnapshots = (state: RootState) =>
    state.accounts.usage.snapshots.snapshot_timestamps;

export const getAccountUsageCurrentSnapshot = (state: RootState) =>
    state.accounts.usage.filters.currentSnapshot;
export const getAccountUsageTreePath = (state: RootState) => state.accounts.usage.filters.treePath;
export const getAccountUsageSortState = (state: RootState) =>
    state.accounts.usage.filters.sortState;

export const getAccountUsageViewType = (state: RootState) => state.accounts.usage.filters.viewType;

export const getAccountUsagePathFilter = (state: RootState) =>
    state.accounts.usage.filters.pathFilter;
export const getAccountUsageOwnerFilter = (state: RootState) =>
    state.accounts.usage.filters.ownerFilter;
export const getAccountUsageDateRangeFilter = (state: RootState) =>
    state.accounts.usage.filters.dateRange;
export const getAccountUsageDateRangeTypeFilter = (state: RootState) =>
    state.accounts.usage.filters.dateRangeType;
export const getAccountsUsageDiffFromSnapshot = (state: RootState) =>
    state.accounts.usage.filters.diffFromSnapshot;
export const getAccountsUsageDiffToSnapshot = (state: RootState) =>
    state.accounts.usage.filters.diffToSnapshot;
const getAccountUsagePageIndexRaw = (state: RootState) => state.accounts.usage.filters.pageIndex;

export const getAccountUsageListRequestParams = (state: RootState) =>
    state.accounts.usage.list.requestParams;
export const getAccountUsageListLoading = (state: RootState) => state.accounts.usage.list.loading;
export const getAccountUsageListLoaded = (state: RootState) => state.accounts.usage.list.loaded;
export const getAccountUsageListError = (state: RootState) => state.accounts.usage.list.error;
export const getAccountUsageListItems = (state: RootState) =>
    state.accounts.usage.list.response?.items || [];
export const getAccountUsageListFields = (state: RootState) =>
    state.accounts.usage.list.response?.fields || [];
export const getAccountUsageListMediums = (state: RootState) =>
    state.accounts.usage.list.response?.mediums || [];
export const getAccountUsageListRowCount = (state: RootState) =>
    state.accounts.usage.list.response?.row_count || 0;

export const getAccountUsageTreeRequestParams = (state: RootState) =>
    state.accounts.usage.tree.requestParams;
export const getAccountUsageTreeLoading = (state: RootState) => state.accounts.usage.tree.loading;
export const getAccountUsageTreeLoaded = (state: RootState) => state.accounts.usage.tree.loaded;
export const getAccountUsageTreeError = (state: RootState) => state.accounts.usage.tree.error;
export const getAccountUsageTreeItems = (state: RootState) =>
    state.accounts.usage.tree.response?.items || [];
export const getAccountUsageTreeFields = (state: RootState) =>
    state.accounts.usage.tree.response?.fields || [];
export const getAccountUsageTreeMediums = (state: RootState) =>
    state.accounts.usage.tree.response?.mediums || [];
export const getAccountUsageTreeRowCount = (state: RootState) =>
    state.accounts.usage.tree.response?.row_count || 0;
export const getAccountUsageTreeItemsBasePath = (state: RootState) =>
    state.accounts.usage.tree.base_path;

export const getAccountUsageListDiffRequestParams = (state: RootState) =>
    state.accounts.usage.listDiff.requestParams;
export const getAccountUsageListDiffLoading = (state: RootState) =>
    state.accounts.usage.listDiff.loading;
export const getAccountUsageListDiffLoaded = (state: RootState) =>
    state.accounts.usage.listDiff.loaded;
export const getAccountUsageListDiffError = (state: RootState) =>
    state.accounts.usage.listDiff.error;
export const getAccountUsageListDiffItems = (state: RootState) =>
    state.accounts.usage.listDiff.response?.items || [];
export const getAccountUsageListDiffFields = (state: RootState) =>
    state.accounts.usage.listDiff.response?.fields || [];
export const getAccountUsageListDiffMediums = (state: RootState) =>
    state.accounts.usage.listDiff.response?.mediums || [];
export const getAccountUsageListDiffRowCount = (state: RootState) =>
    state.accounts.usage.listDiff.response?.row_count || 0;

export const getAccountUsageTreeDiffRequestParams = (state: RootState) =>
    state.accounts.usage.treeDiff.requestParams;
export const getAccountUsageTreeDiffLoading = (state: RootState) =>
    state.accounts.usage.treeDiff.loading;
export const getAccountUsageTreeDiffLoaded = (state: RootState) =>
    state.accounts.usage.treeDiff.loaded;
export const getAccountUsageTreeDiffError = (state: RootState) =>
    state.accounts.usage.treeDiff.error;
export const getAccountUsageTreeDiffItems = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.items || [];
export const getAccountUsageTreeDiffFields = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.fields || [];
export const getAccountUsageTreeDiffMediums = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.mediums || [];
export const getAccountUsageTreeDiffRowCount = (state: RootState) =>
    state.accounts.usage.treeDiff.response?.row_count || 0;
export const getAccountUsageTreeDiffItemsBasePath = (state: RootState) =>
    state.accounts.usage.treeDiff.base_path;

export const isAccountsUsageDiffView = createSelector([getAccountUsageViewType], (viewType) => {
    return viewType?.endsWith('-diff');
});

export const getAccountUsageTreeItemsBasePathSplitted = createSelector(
    [
        getAccountUsageViewType,
        getAccountUsageTreeItemsBasePath,
        getAccountUsageTreeDiffItemsBasePath,
    ],
    (viewType, treePath, treeDiffPath) => {
        const path = viewType === 'tree-diff' ? treeDiffPath : treePath;
        if (!path) {
            return [];
        }

        const fragments: Array<{name: string}> = new ypath.YPath(path, 'absolute').fragments || [];

        return _.map(fragments, (item, index) => {
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

export const getAccountUsageFieldFiltersRequestParameter = createSelector(
    [getAccountUsageDateRangeFilter, getAccountUsageDateRangeTypeFilter],
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

export const getAccountUsagePageCount = createSelector(
    [
        getAccountUsageViewType,
        getAccountUsageListRowCount,
        getAccountUsageTreeRowCount,
        getAccountUsageListDiffRowCount,
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

export const getAccountUsagePageIndex = createSelector(
    [getAccountUsagePageIndexRaw],
    (pageIndex) => {
        return Math.max(0, Number(pageIndex));
    },
);

export const getAccountUsageSortStateByColumn = createSelector(
    [getAccountUsageSortState],
    (sortState) => {
        return _.reduce(
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

export const getAccountUsageAvailableColumns = createSelector(
    [
        getAccountUsageViewType,
        getAccountUsageListFields,
        getAccountUsageTreeFields,
        getAccountUsageListDiffFields,
        getAccountUsageTreeDiffFields,
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

const getAccountUsageVisibleColumns = createSelector(
    [
        getAccountUsageViewType,
        getSettingsAccountUsageColumnsTree,
        getSettingsAccountUsageColumnsList,
        getSettingsAccountUsageColumnsListFolders,
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

export const getAccountUsageSelectableColumns = createSelector(
    [getAccountUsageAvailableColumns],
    (columns) => {
        return _.filter(columns, (item) => !ACCOUNT_USAGE_UNAVAILABLE_FIELDS.has(item));
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

export const getAccountUsageVisibleDataColumns = createSelector(
    [getAccountUsageSelectableColumns, getAccountUsageVisibleColumns],
    (selectableColumns, userColumns) => {
        const columns = new Set<string>(selectableColumns);

        return ['type', 'path'].concat(
            _.filter(userColumns, (item) => {
                return columns.has(item);
            }),
        );
    },
);
