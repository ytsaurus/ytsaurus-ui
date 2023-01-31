import _ from 'lodash';
import {createSelector} from 'reselect';
import {getPreparedDataForColumns, getTabletsMode, getTabletsSortState} from './tablets';
import {
    FieldDescr,
    flattenTree,
    sortTree,
    TreeItem,
    TreeNode,
} from '../../../../common/hammer/tree-list';
import {OldSortState, TypedKeys} from '../../../../types';
import {RootState} from '../../../reducers';

export const getTabletsExpandedHosts = (state: RootState): Array<string> =>
    state.navigation.tabs.tablets.expandedHosts;

interface TabletInfo {
    name: string;
    level?: number;
    tablet_id: string;
    cell_id: string;
    cell_leader_address: string;
    unmerged_row_count: number;
    uncompressed_data_size: number;
    compressed_data_size: number;
    disk_space: number;
    childrenCount?: number;
}

const SUM_FIELDS: Array<TypedKeys<TabletInfo, number>> = [
    'unmerged_row_count',
    'uncompressed_data_size',
    'compressed_data_size',
    'disk_space',
];

function addHostItem(
    dst: TreeNode<TabletInfo, TabletInfo>,
    item: TabletInfo,
    maxDst: Pick<TabletInfo, TypedKeys<TabletInfo, number>>,
) {
    dst.children.push({
        name: item.tablet_id,
        parent: dst.name,
        attributes: {
            ...item,
            name: item.tablet_id,
            level: 1,
        },
        leaves: [],
        children: [],
    });

    _.forEach(SUM_FIELDS, (k) => {
        dst.attributes[k] += item[k];

        maxDst[k] = _.max([maxDst[k], item[k]])!;
    });
}

export const getTabletsMax = createSelector([getPreparedDataForColumns], (items) => {
    const max = {
        unmerged_row_count: 0,
        uncompressed_data_size: 0,
        compressed_data_size: 0,
        disk_space: 0,
    };
    _.forEach(items, (item) => {
        _.forEach(SUM_FIELDS, (k) => {
            max[k] = _.max([max[k], item[k]])!;
        });
    });
    return max;
});

const getTabletsByNameRoot = createSelector(
    [getPreparedDataForColumns, getTabletsSortState, getTabletsMode],
    (sortedAndFilteredItems, sortState, mode) => {
        const groupByKey = mode === 'by_host' ? 'cell_leader_address' : 'cell_id';

        const maxDst = {
            unmerged_row_count: 0,
            uncompressed_data_size: 0,
            compressed_data_size: 0,
            disk_space: 0,
        };
        const maxHost = {...maxDst};
        const mapByName: Record<string, TreeNode<TabletInfo, TabletInfo>> = {};
        _.forEach(sortedAndFilteredItems, (item) => {
            const {[groupByKey]: groupBy, cell_leader_address, cell_id} = item;
            const dst = (mapByName[groupBy] = mapByName[groupBy] || {
                name: groupBy,
                children: [],
                leaves: [],
                attributes: {
                    isTopLevel: true,
                    name: groupBy,
                    cell_leader_address,
                    cell_id,
                    unmerged_row_count: 0,
                    uncompressed_data_size: 0,
                    compressed_data_size: 0,
                    disk_space: 0,
                    level: 0,
                },
            });
            addHostItem(dst, item, maxDst);
        });

        const root = {
            name: '',
            children: _.toArray(mapByName),
            leaves: [],
            attributes: {} as any,
        };

        _.forEach(root.children, (item) => {
            item.attributes.childrenCount = item.children.length;
            _.forEach(SUM_FIELDS, (k) => {
                maxHost[k] = _.max([maxHost[k], item.attributes[k]])!;
            });
        });

        sortTreeInPlace(root, sortState);
        return {
            maxByLevel: [maxHost, maxDst] as const,
            root,
        };
    },
);

export const getTabletsByName = createSelector(
    [getTabletsByNameRoot, getTabletsExpandedHosts],
    ({root, maxByLevel}, expandedHosts) => {
        const expanded = new Set(expandedHosts);
        const children = _.map(root.children, (item) => {
            const {name} = item;
            const isCollapsed = !expanded.has(name);
            return {
                ...item,
                attributes: {
                    ...item.attributes,
                    isCollapsed,
                },
                children: isCollapsed ? [] : item.children,
            };
        });

        return {
            maxByLevel,
            items: _.map(flattenTree({...root, children}), 'attributes'),
        };
    },
);

function sortTreeInPlace(root: TreeNode<TabletInfo, TabletInfo>, sortState?: OldSortState) {
    if (!sortState?.field) {
        return;
    }

    sortTree(root, sortState, {
        name_tablet_id: {
            get(item) {
                return item.attributes.name;
            },
        },
        name_cell_id: {
            get(item) {
                return item.attributes.name;
            },
        },
        ..._.reduce(
            Object.keys(root.children[0]?.attributes! || {}) as Array<keyof TabletInfo>,
            (acc, k) => {
                acc[k] = {
                    get(item: TreeItem<TabletInfo, TabletInfo>) {
                        return item.attributes[k];
                    },
                };
                return acc;
            },
            {} as Record<string, FieldDescr<TabletInfo, TabletInfo>>,
        ),
    });
}
