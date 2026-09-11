import type {FlowKeySchemaResolution, FlowStateFiltersValue} from './types';
import type {FlowStaticSpec} from '../../../../../shared/yt-types';

export const keyColumns = [
    {name: 'hash', type: 'uint64', expression: 'farm_hash(key)'},
    {name: 'key', type: 'uint64'},
];

export const spec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/state': {}},
        },
    },
};

export const joinedSpec: FlowStaticSpec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/state': {}},
            external_state_joiners: {'/joined': {}, '/state': {}},
        },
    },
};

export function filters(overrides: Partial<FlowStateFiltersValue>): FlowStateFiltersValue {
    return {keyValues: {}, target: 'all', ...overrides};
}

export const overrideColumns = [
    {name: 'bucket', type: 'uint64', expression: 'farm_hash(region)'},
    {name: 'region', type: 'string'},
];

export const joinerOverrideSpec: FlowStaticSpec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/state': {}},
            external_state_joiners: {
                '/joined': {join_on: {key_schema_override: overrideColumns}},
                '/streams-only': {join_on: {key_provider_streams: ['input']}},
                '/plain': {},
            },
        },
    },
};

export const wrappedJoinerOverrideSpec: FlowStaticSpec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/state': {}},
            external_state_joiners: {
                $attributes: {opaque: true},
                $value: {
                    '/joined': {
                        $attributes: {},
                        $value: {
                            join_on: {
                                $attributes: {},
                                $value: {
                                    key_schema_override: {
                                        $attributes: {strict: true, unique_keys: true},
                                        $value: overrideColumns,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export const collisionSpec: FlowStaticSpec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/both': {}},
            external_state_joiners: {
                '/both': {join_on: {key_schema_override: overrideColumns}},
            },
        },
    },
};

export const computationResolution: FlowKeySchemaResolution = {
    keyColumns: [keyColumns[1]],
    allKeyColumns: keyColumns,
    overrideActive: false,
};

export const overrideResolution: FlowKeySchemaResolution = {
    keyColumns: [overrideColumns[1]],
    allKeyColumns: overrideColumns,
    overrideActive: true,
};
