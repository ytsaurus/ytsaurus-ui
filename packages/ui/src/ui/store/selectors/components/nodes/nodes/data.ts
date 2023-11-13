import filter_ from 'lodash/filter';
import some_ from 'lodash/some';
import union_ from 'lodash/union';

import hammer from '../../../../../common/hammer';
import {createSelector} from 'reselect';

import {concatByAnd} from '../../../../../common/hammer/predicate';
import {COMPONENTS_NODES_TABLE_ID} from '../../../../../constants/components/nodes/nodes';
import {RootState} from '../../../../../store/reducers';
import {AttributesByProperty} from '../../../../../store/reducers/components/nodes/nodes/node';
import {getCluster} from '../../../../../store/selectors/global';
import {getSelectedColumns} from '../../../../../store/selectors/settings';
import {getMediumListNoCache} from '../../../../../store/selectors/thor';
import type {ValueOf} from '../../../../../types';
import {createMediumsPredicates} from '../../../../../utils/components/nodes/setup';
import {
    PropertiesByColumn,
    defaultColumns,
    getNodeTablesProps,
} from '../../../../../utils/components/nodes/tables';
import {
    getComponentNodesFilterPredicates,
    getComponentNodesFilterStatePredicate,
    getComponentNodesFiltersSetup,
    getComponentNodesIndexByRack,
    getComponentNodesIndexByTag,
    getNodes,
    getPropertiesRequiredForFilters,
} from './predicates';
import {NODE_TYPE, NodeType} from '../../../../../../shared/constants/system';

const getContentMode = (state: RootState) => state.components.nodes.nodes.contentMode;
const getHostFilter = (state: RootState) => state.components.nodes.nodes.hostFilter.toLowerCase();
const getSortState = (state: RootState) => state.tables[COMPONENTS_NODES_TABLE_ID];
const getComponentsNodesNodeTypeRaw = (state: RootState) => state.components.nodes.nodes.nodeTypes;

const getCustomColumns = (state: RootState) => getSelectedColumns(state) || defaultColumns;

const getMediumsPredicates = createSelector(
    [getComponentNodesFiltersSetup, getMediumListNoCache],
    createMediumsPredicates,
);

const getPropertiesRequiredForMediums = createSelector(
    [getMediumsPredicates],
    (mediumsPredicates) => (mediumsPredicates.length > 0 ? (['IOWeight'] as const) : []),
);

const getFilteredByHost = createSelector([getNodes, getHostFilter], (nodes, hostFilter) => {
    const hostFilters = hostFilter.split(/\s+/);
    return filter_(nodes, (node) => {
        return some_(hostFilters, (hostFilter) => node?.host?.toLowerCase().startsWith(hostFilter));
    });
});

const getFilteredNodes = createSelector(
    [getFilteredByHost, getComponentNodesFilterPredicates, getMediumsPredicates],
    (nodes, predicates, mediumsPredicates) => {
        const predicatesArray = predicates.concat(mediumsPredicates);
        if (!predicatesArray.length) {
            return nodes;
        }

        const predicate = concatByAnd(...predicatesArray);
        return filter_(nodes, (node) => {
            return predicate(node);
        });
    },
);

export const getVisibleNodes = createSelector(
    [getFilteredNodes, getSortState, getMediumListNoCache, getCluster],
    (nodes, sortState, mediumList, cluster) => {
        return hammer.utils.sort(
            nodes.map((n) => ({...n, cluster})),
            sortState,
            getNodeTablesProps(mediumList).columns.items,
        ) as typeof nodes;
    },
);

export const getComponentNodesTableProps = createSelector(
    [getMediumListNoCache],
    getNodeTablesProps,
);

const getVisibleColumns = createSelector(
    [getComponentNodesTableProps, getContentMode, getCustomColumns],
    (nodesTableProps, contentMode, customColumns) =>
        contentMode === 'custom' ? customColumns : nodesTableProps.columns.sets[contentMode].items,
);

const getPropertiesRequiredForRender = createSelector(
    [getVisibleColumns],
    (visibleColumns /* : Array<keyof typeof PropertiesByColumn> */) => {
        const requiredProperties = union_(
            ...visibleColumns.map(
                (x) => (PropertiesByColumn as any)[x] as ValueOf<typeof PropertiesByColumn>,
            ),
        );

        return requiredProperties;
    },
);

export const getRequiredAttributes = createSelector(
    [
        getPropertiesRequiredForRender,
        getPropertiesRequiredForFilters,
        getPropertiesRequiredForMediums,
    ],
    (propertiesRequiredForRender, propertiesRequiredForFilters, propertiesRequiredForMediums) => {
        const allRequiredProperties = [
            ...propertiesRequiredForRender,
            ...propertiesRequiredForFilters,
            ...propertiesRequiredForMediums,
        ];

        const requiredAttributes = union_(
            ...allRequiredProperties.map(
                (x) => (AttributesByProperty as any)[x] as ValueOf<typeof AttributesByProperty>,
            ),
        );

        return requiredAttributes;
    },
);

export const useTagsFromAttributes = createSelector([getRequiredAttributes], (attributes) => {
    return attributes.indexOf('tags') >= 0;
});

export const useRacksFromAttributes = createSelector([getRequiredAttributes], (attributes) => {
    return attributes.indexOf('rack') >= 0;
});

const getFetchedTags = (state: RootState): string[] =>
    state.components.nodes.nodes.filterOptionsTags;
const getFetchedRacks = (state: RootState): string[] =>
    state.components.nodes.nodes.filterOptionsRacks;

export const getComponentNodesTags = createSelector(
    [useTagsFromAttributes, getFetchedTags, getComponentNodesIndexByTag],
    (useFromAttrs, fetchedTags, nodesByTag) => {
        if (!useFromAttrs) {
            return fetchedTags;
        }

        return [...nodesByTag.keys()].sort();
    },
);

export const getComponentNodesRacks = createSelector(
    [useRacksFromAttributes, getFetchedRacks, getComponentNodesIndexByRack],
    (useFromAttrs, fetchedRacks, nodesByRack) => {
        if (!useFromAttrs) {
            return fetchedRacks;
        }

        return [...nodesByRack.keys()].sort();
    },
);

export const getComponentsNodesNodeTypes = createSelector(
    [getComponentsNodesNodeTypeRaw],
    (types) => {
        const res: Array<NodeType> = [...types];
        if (res.length === 0) {
            return [NODE_TYPE.ALL_NODES];
        }
        return res;
    },
);

export const COMPONENTS_AVAILABLE_STATES = [
    'all',
    'being_disposed',
    'online',
    'offline',
    'mixed',
    'registered',
    'unregistered',
    'unknown',
];

export const getComponentNodesFilterSetupStateValue = createSelector(
    [getComponentNodesFilterStatePredicate],
    (predicate) => {
        if (!predicate) {
            return ['all'];
        }

        return COMPONENTS_AVAILABLE_STATES.map((state) => ({state}))
            .filter(predicate)
            .map(({state}) => state);
    },
);
