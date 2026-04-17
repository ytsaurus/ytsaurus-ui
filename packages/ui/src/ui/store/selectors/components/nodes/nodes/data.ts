import filter_ from 'lodash/filter';
import some_ from 'lodash/some';
import union_ from 'lodash/union';

import hammer from '../../../../../common/hammer';
import {createSelector} from 'reselect';

import {concatByAnd} from '../../../../../common/hammer/predicate';
import {COMPONENTS_NODES_TABLE_ID} from '../../../../../constants/components/nodes/nodes';
import {RootState} from '../../../../../store/reducers';
import {AttributesByProperty} from '../../../../../store/reducers/components/nodes/nodes/node';
import {selectCluster} from '../../../../../store/selectors/global';
import {getSelectedColumns} from '../../../../../store/selectors/settings';
import {getMediumListNoCache} from '../../../../../store/selectors/thor';
import type {ValueOf} from '../../../../../types';
import {createMediumsPredicates} from '../../../../../utils/components/nodes/setup';
import {
    PropertiesByColumn,
    defaultColumns,
    getNodeTablesProps,
} from '../../../../../pages/components/tabs/nodes/tables';
import {
    selectComponentNodesFilterPredicates,
    selectComponentNodesFilterStatePredicate,
    selectComponentNodesFiltersSetup,
    selectComponentNodesIndexByRack,
    selectComponentNodesIndexByTag,
    selectNodes,
    selectPropertiesRequiredForFilters,
} from './predicates';
import {NODE_TYPE, NodeType} from '../../../../../../shared/constants/system';

const selectContentMode = (state: RootState) => state.components.nodes.nodes.contentMode;

const selectHostFilter = (state: RootState) =>
    state.components.nodes.nodes.hostFilter.toLowerCase();

const selectSortState = (state: RootState) => state.tables[COMPONENTS_NODES_TABLE_ID];

const selectComponentsNodesNodeTypeRaw = (state: RootState) =>
    state.components.nodes.nodes.nodeTypes;

const selectCustomColumns = (state: RootState) => getSelectedColumns(state) || defaultColumns;

const selectMediumsPredicates = createSelector(
    [selectComponentNodesFiltersSetup, getMediumListNoCache],
    createMediumsPredicates,
);

const getPropertiesRequiredForMediums = createSelector(
    [selectMediumsPredicates],
    (mediumsPredicates) => (mediumsPredicates.length > 0 ? (['IOWeight'] as const) : []),
);

const selectFilteredByHost = createSelector(
    [selectNodes, selectHostFilter],
    (nodes, hostFilter) => {
        const hostFilters = hostFilter.split(/\s+/);
        return filter_(nodes, (node) => {
            return some_(hostFilters, (hostFilter) =>
                node?.host?.toLowerCase().includes(hostFilter),
            );
        });
    },
);

const selectFilteredNodes = createSelector(
    [selectFilteredByHost, selectComponentNodesFilterPredicates, selectMediumsPredicates],
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

export const selectVisibleNodes = createSelector(
    [selectFilteredNodes, selectSortState, getMediumListNoCache, selectCluster],
    (nodes, sortState, mediumList, cluster) => {
        return hammer.utils.sort(
            nodes.map((n) => ({...n, cluster})),
            sortState,
            getNodeTablesProps(mediumList).columns.items,
        ) as typeof nodes;
    },
);

export const selectComponentNodesTableProps = createSelector(
    [getMediumListNoCache],
    getNodeTablesProps,
);

const selectVisibleColumns = createSelector(
    [selectComponentNodesTableProps, selectContentMode, selectCustomColumns],
    (nodesTableProps, contentMode, customColumns) =>
        contentMode === 'custom' ? customColumns : nodesTableProps.columns.sets[contentMode].items,
);

const selectPropertiesRequiredForRender = createSelector(
    [selectVisibleColumns],
    (visibleColumns /* : Array<keyof typeof PropertiesByColumn> */) => {
        const requiredProperties = union_(
            ...visibleColumns.map(
                (x) => (PropertiesByColumn as any)[x] as ValueOf<typeof PropertiesByColumn>,
            ),
        );

        return requiredProperties;
    },
);

export const selectRequiredAttributes = createSelector(
    [
        selectPropertiesRequiredForRender,
        selectPropertiesRequiredForFilters,
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

export const selectTagsFromAttributes = createSelector([selectRequiredAttributes], (attributes) => {
    return attributes.indexOf('tags') >= 0;
});

export const selectRacksFromAttributes = createSelector(
    [selectRequiredAttributes],
    (attributes) => {
        return attributes.indexOf('rack') >= 0;
    },
);

const selectFetchedTags = (state: RootState): string[] =>
    state.components.nodes.nodes.filterOptionsTags;

const selectFetchedRacks = (state: RootState): string[] =>
    state.components.nodes.nodes.filterOptionsRacks;

export const selectComponentNodesTags = createSelector(
    [selectTagsFromAttributes, selectFetchedTags, selectComponentNodesIndexByTag],
    (useFromAttrs, fetchedTags, nodesByTag) => {
        if (!useFromAttrs) {
            return fetchedTags;
        }

        return [...nodesByTag.keys()].sort();
    },
);

export const selectComponentNodesRacks = createSelector(
    [selectRacksFromAttributes, selectFetchedRacks, selectComponentNodesIndexByRack],
    (useFromAttrs, fetchedRacks, nodesByRack) => {
        if (!useFromAttrs) {
            return fetchedRacks;
        }

        return [...nodesByRack.keys()].sort();
    },
);

export const selectComponentsNodesNodeTypes = createSelector(
    [selectComponentsNodesNodeTypeRaw],
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

export const selectComponentNodesFilterSetupStateValue = createSelector(
    [selectComponentNodesFilterStatePredicate],
    (predicate) => {
        if (!predicate) {
            return ['all'];
        }

        return COMPONENTS_AVAILABLE_STATES.map((state) => ({state}))
            .filter(predicate)
            .map(({state}) => state);
    },
);
