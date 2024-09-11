import forEach_ from 'lodash/forEach';
import get_ from 'lodash/get';
import keys_ from 'lodash/keys';
import reduce_ from 'lodash/reduce';
import set_ from 'lodash/set';

import produce from 'immer';

import {initialState as nodesInitialState} from '../../../../store/reducers/components/nodes/nodes/nodes';
import {initialState as tableSortState} from '../../../../store/reducers/tables';

import {COMPONENTS_NODES_TABLE_ID} from '../../../../constants/components/nodes/nodes';
import {parseSortState} from '../../../../utils';

import {
    TagFilter,
    groupFilterInitialState,
    initialState,
} from '../../../../store/reducers/components/nodes/setup/setup';
import {
    makeObjectParseSerialize,
    parseSerializeArrayString,
    parseSerializeBoolean,
    parseSerializeString,
    parseSerializeSymbolCreate,
} from '../../../../utils/parse-serialize';
import {RootState} from '../../../../store/reducers';
import {LocationParameters} from '../../../../store/location';

const {
    from: {value: fromInitialValue},
    to: {value: toInitialValue},
} = groupFilterInitialState;

const createStateKey = (group: string, key: string, direction: string) =>
    `components.nodes.setup.${group}.${key}.${direction}.value`;
const createParam = (group: string, value: string, direction: string) => ({
    stateKey: createStateKey(group, value, direction),
    options: {serialize: (value: any) => value},
    initialState: direction === 'from' ? fromInitialValue : toInitialValue,
    type: 'number',
});
const createParams = (group: string, values: Array<string>) =>
    reduce_(
        values,
        (res, value) => {
            res[`${value}From`] = createParam(group, value, 'from');
            res[`${value}To`] = createParam(group, value, 'to');

            return res;
        },
        {} as Record<string, ReturnType<typeof createParam>>,
    );

// default
const {
    physicalHost: physicalHostInitialState,
    state: stateInitialState,
    tag: tagInitialState,
    rack: rackInitialState,
    banned: bannedInitialState,
    decommissioned: decommissionedInitialState,
    full: fullInitialState,
    alertCount: alertsInitialState,
    schedulerJobs: schedulerJobsInitialState,
    writeSessions: writeSessionsInitialState,
    tabletCells: tabletCellsInitialState,
} = initialState.default;

const defaultParams = {
    tag: {
        stateKey: 'components.nodes.setup.default.tag',
        initialState: tagInitialState,
        options: {
            ...makeObjectParseSerialize(tagInitialState as TagFilter, {
                mode: parseSerializeSymbolCreate<Required<TagFilter>['mode']>(),
                selected: parseSerializeArrayString,
                filter: parseSerializeString,
                useRegexp: parseSerializeBoolean,
                regexpError: parseSerializeString,
            }),
        },
    },
    physicalHost: {
        stateKey: 'components.nodes.setup.default.physicalHost',
        initialState: physicalHostInitialState,
    },
    state: {
        stateKey: 'components.nodes.setup.default.state',
        initialState: stateInitialState,
        type: 'array',
        options: {
            delimiter: ',',
        },
    },
    rack: {
        stateKey: 'components.nodes.setup.default.rack',
        initialState: rackInitialState,
        options: {
            ...makeObjectParseSerialize(rackInitialState as TagFilter, {
                mode: parseSerializeSymbolCreate<Required<TagFilter>['mode']>(),
                selected: parseSerializeArrayString,
                filter: parseSerializeString,
                useRegexp: parseSerializeBoolean,
                regexpError: parseSerializeString,
            }),
        },
    },
    banned: {
        stateKey: 'components.nodes.setup.default.banned',
        initialState: bannedInitialState,
    },
    decommissioned: {
        stateKey: 'components.nodes.setup.default.decommissioned',
        initialState: decommissionedInitialState,
    },
    full: {
        stateKey: 'components.nodes.setup.default.full',
        initialState: fullInitialState,
    },
    alerts: {
        stateKey: 'components.nodes.setup.default.alertCount',
        initialState: alertsInitialState,
    },
    schedulerJobs: {
        stateKey: 'components.nodes.setup.default.schedulerJobs',
        initialState: schedulerJobsInitialState,
    },
    writeSessions: {
        stateKey: 'components.nodes.setup.default.writeSessions',
        initialState: writeSessionsInitialState,
    },
    tabletCells: {
        stateKey: 'components.nodes.setup.default.tabletCells',
        initialState: tabletCellsInitialState,
    },
};

// storage
const storageKey = 'storage';
const storageValues = keys_(initialState[storageKey]);

// cpu
const cpuKey = 'cpu';
const cpuValues = keys_(initialState[cpuKey]);

// resources
const resourcesKey = 'resources';
const resourcesValues = keys_(initialState[resourcesKey]);

// tablets
const tabletsKey = 'tablets';
const tabletsValues = keys_(initialState[tabletsKey]);

// aggregated
export const setupNodesParams = {
    ...defaultParams,
    ...createParams(storageKey, storageValues),
    ...createParams(cpuKey, cpuValues),
    ...createParams(resourcesKey, resourcesValues),
    ...createParams(tabletsKey, tabletsValues),
};

const initialContentMode = nodesInitialState.contentMode;
const initialHostFilter = nodesInitialState.hostFilter;
const initialNodeType = nodesInitialState.nodeTypes;

const initialSortState = {...tableSortState[COMPONENTS_NODES_TABLE_ID]};

export const nodesParams: LocationParameters = {
    ...setupNodesParams,
    contentMode: {
        stateKey: 'components.nodes.nodes.contentMode',
        initialState: initialContentMode,
    },
    nodeType: {
        stateKey: 'components.nodes.nodes.nodeTypes',
        initialState: initialNodeType,
        type: 'array',
        options: {delimiter: ','},
    },
    host: {
        stateKey: 'components.nodes.nodes.hostFilter',
        initialState: initialHostFilter,
    },
    nodeSort: {
        stateKey: `tables.${COMPONENTS_NODES_TABLE_ID}`,
        initialState: initialSortState,
        options: {parse: parseSortState},
        type: 'object',
    },
};

export function getNodesPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        forEach_(nodesParams, ({stateKey}) => {
            // TODO: Rewrite without _.get
            const prev = get_(draft, stateKey);
            const value = get_(query, stateKey);
            if (prev !== value) {
                set_(draft, stateKey, value);
            }
        });
    });
}
