import React from 'react';

import {createSelector} from 'reselect';
import _ from 'lodash';
import moment from 'moment';

import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
import {getParsedPath, getTransaction} from '../../../../store/selectors/navigation';
import {makeGetSetting} from '../../../../store/selectors/settings';
import {NAMESPACES, SettingName} from '../../../../../shared/constants/settings';
import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../../../constants/navigation';
import Node from '../../../../utils/navigation/content/map-nodes/node';
import {MediumType} from '../../../../constants/index';
import Chooser from '../../../../pages/navigation/content/MapNode/Chooser';
import MultipleActions from '../../../../pages/navigation/content/MapNode/MultipleActions';
import {DYN_TABLES_ALLOWED_ACTIONS_BY_STATE} from './map-node-ts';

export const getFilterState = (state) => state.navigation.content.mapNode.filter;
export const getMediumType = (state) => state.navigation.content.mapNode.mediumType;

const getCustomSort = (state) => state.navigation.content.mapNode.customSort;
const getTableColumns = createSelector(
    [getCustomSort, getMediumType],
    (customSort, mediumType) => ({
        chooser: {
            sort: false,
            align: 'center',
            renderHeader: () => <Chooser />,
        },
        icon: {
            sort: false,
            caption: '',
            align: 'center',
        },
        name: {
            sort: (node) => node.titleUnquoted,
            caption: () => {
                return customSort === 'date' ? 'Date' : 'Name';
            },
            align: 'left',
        },
        locks: {
            sort: (node) => node.locks,
            align: 'center',
        },
        account: {
            sort: (node) => node.account,
            align: 'left',
        },
        modification_time: {
            sort: (node) => moment(node.modified).unix(),
            align: 'right',
        },
        creation_time: {
            sort: (node) => moment(node.created).unix(),
            align: 'right',
        },
        disk_space: {
            get: (node) => {
                return mediumType === MediumType.ALL ? node.size : node.sizePerMedium?.[mediumType];
            },
            sort: true,
            align: 'right',
        },
        data_weight: {
            get: (node) => node.dataWeight,
            sort: true,
            align: 'right',
        },
        chunk_count: {
            get: (node) => node.chunks,
            sort: true,
            align: 'right',
        },
        node_count: {
            get: (node) => node.nodes,
            sort: true,
            align: 'right',
        },
        row_count: {
            get: (node) => node.chunkRows,
            sort: true,
            align: 'right',
        },
        tablet_static_memory: {
            get: (node) => node.tabletStaticMemory,
            caption: 'Tablet st.',
            title: 'Tablet static memory',
            sort: true,
            align: 'right',
        },
        master_memory: {
            get: (node) => node.masterMemory,
            caption: 'Master mem.',
            title: 'Master memory',
            sort: true,
            align: 'right',
        },
        tablet_count: {
            get: (node) => node.tablets,
            sort: true,
            align: 'right',
        },
        actions: {
            sort: false,
            caption: '',
            align: 'center',
        },
        multipleActions: {
            sort: false,
            align: 'center',
            renderHeader: () => <MultipleActions />,
        },
    }),
);
export const getPreparedTableColumns = createSelector(getTableColumns, (columns) =>
    _.transform(
        columns,
        (preparedColumns, column, name) => {
            preparedColumns[name] = {
                ...column,
                name,
                caption: typeof column.caption === 'function' ? column.caption() : column.caption,
            };
        },
        {},
    ),
);

export const getContentMode = (state) => state.navigation.content.mapNode.contentMode;
export const getSelected = (state) => state.navigation.content.mapNode.selected;
export const getLastSelected = (state) => state.navigation.content.mapNode.lastSelected;
const getTextFilter = (state) => state.navigation.content.mapNode.filter;

const getSortState = (state) => state.tables[NAVIGATION_MAP_NODE_TABLE_ID];
export const getNodesData = (state) => state.navigation.content.mapNode.nodesData;

const getNodes = createSelector(
    [getNodesData, getParsedPath, getTransaction],
    (nodesData, parsedPath, transaction) => {
        return _.map(nodesData, (data) => new Node(data, {parsedPath, transaction}));
    },
);

export const getFilteredNodes = createSelector(
    [getNodes, makeGetSetting, getTextFilter],
    (nodes, getSetting, filter) => {
        const useSmartFilter = getSetting('useSmartFilter', NAMESPACES.NAVIGATION);
        if (useSmartFilter) {
            return hammer.filter.multifilter({
                data: nodes,
                input: filter,
                factors: ['titleUnquoted'],
            });
        } else {
            return hammer.filter.filter({
                data: nodes,
                input: filter,
                factors: ['titleUnquoted'],
            });
        }
    },
);

export const getSelectedNodes = createSelector(
    [getSelected, getNodes, makeGetSetting, getSortState, getTableColumns],
    (selected, allNodes, getSetting, sortState, columns) => {
        const nodes = _.filter(allNodes, (node) => Boolean(selected[ypath.getValue(node)]));
        const groupNodes = getSetting(SettingName.NAVIGATION.GROUP_NODES, NAMESPACES.NAVIGATION);
        const groupByType = groupNodes && {
            get: (node) => TYPE_WEIGHTS[node.type] || 0,
            asc: false,
        };

        return hammer.utils.sort(nodes, sortState, columns, {
            groupBy: groupByType,
        });
    },
);

export const getSelectedPathMap = createSelector([getSelectedNodes], (nodes) => {
    return _.reduce(
        nodes,
        (acc, {path}) => {
            acc[path] = true;
            return acc;
        },
        {},
    );
});

export const isSelected = createSelector(getSelected, (selected) => {
    return _.includes(_.values(selected), true);
});

export const getIsAllSelected = createSelector(
    [getSelected, getFilteredNodes],
    (selected, allNodes) => {
        const selectedNodes = _.keys(selected);

        if (allNodes.length === 0) {
            return false;
        }

        return _.every(_.values(selected)) && selectedNodes.length === allNodes.length;
    },
);

const TYPE_WEIGHTS = _.map(
    [
        'tablet_cell',
        'cell_node_map',
        'cell_node',
        'sys_node',
        'access_control_object_namespace_map',
        'access_control_object_namespace',
        'topmost_transaction_map',
        'transaction_map',
        'map_node',
        'link',
        'table',
        'file',
        'document',
        'journal',
        'string_node',
        'int64_node',
        'uint64_node',
        'double_node',
        'boolean_node',
    ],
    (type, index, types) => ({type, weight: types.length - index}),
).reduce((res, item) => {
    res[item.type] = item.weight;
    return res;
}, {});

export const getSortedNodes = createSelector(
    [getFilteredNodes, getSortState, getTableColumns, makeGetSetting],
    (nodes, sortState, columns, getSetting) => {
        const groupNodes = getSetting(SettingName.NAVIGATION.GROUP_NODES, NAMESPACES.NAVIGATION);
        const groupByType = groupNodes && {
            get: (node) => TYPE_WEIGHTS[node.type] || 0,
            asc: false,
        };
        return hammer.utils.sort(nodes, sortState, columns, {
            groupBy: groupByType,
        });
    },
);

export const getNodesInfo = createSelector(getSortedNodes, (nodes) => {
    const sumNodesType = hammer.aggregation.countValues(nodes, 'type');

    return _.map(Object.entries(sumNodesType), (keyValue) => {
        const [key, value] = keyValue;
        const type = key === 'undefined' ? 'Unknown' : key;
        return {
            type: hammer.format['Readable'](type),
            count: value,
        };
    });
});

export const isRootNode = createSelector(
    getParsedPath,
    (parsedPath) => parsedPath.stringify() === '/',
);

export const getMapNodeResourcesLoading = (state) =>
    state.navigation.content.mapNode.resourcesLoading;

const DATE_REGEXP = /^\d{4}[-]\d{2}[-]\d{2}(T\d{2}:\d{2}:\d{2})?(\.[a-zA-Z0-9]+)?$/;
export const shouldApplyCustomSort = createSelector(
    [getNodes, makeGetSetting, getSortState],
    (nodes, getSetting, sortState) =>
        getSetting(SettingName.NAVIGATION.USE_SMART_SORT, NAMESPACES.NAVIGATION) &&
        sortState?.field === 'name' &&
        _.every(nodes, (item) => DATE_REGEXP.test(item.name)),
);

export const getLoadState = (state) => state.navigation.content.mapNode.loadState;
export const getError = (state) => state.navigation.content.mapNode.error;

export const getSelectedIndex = createSelector(
    [getSortedNodes, getFilterState],
    (nodes, filter) => {
        if (filter) {
            const strictIndex = _.findIndex(nodes, ({name}) => name === filter);

            if (strictIndex === -1) {
                return _.findIndex(nodes, ({name}) => name.startsWith(filter));
            }

            return strictIndex;
        }

        return 0;
    },
);

export const getSelectedNodesDynTablesStates = createSelector([getSelectedNodes], (nodes) => {
    const res = _.reduce(
        nodes,
        (acc, item) => {
            if (item.tabletState) {
                acc[item.tabletState] = true;
            }
            return acc;
        },
        {frozen: false, mounted: false, unmounted: false},
    );
    return res;
});

export const getSelectedNodesAllowedDynTablesActions = createSelector(
    [getSelectedNodesDynTablesStates],
    (dynTablesStates) => {
        const res = _.reduce(
            dynTablesStates,
            (acc, value, state) => {
                if (value) {
                    Object.assign(acc, DYN_TABLES_ALLOWED_ACTIONS_BY_STATE[state]);
                }
                return acc;
            },
            {mount: false, unmount: false, freeze: false, unfreeze: false},
        );
        return _.pickBy(res, Boolean);
    },
);
