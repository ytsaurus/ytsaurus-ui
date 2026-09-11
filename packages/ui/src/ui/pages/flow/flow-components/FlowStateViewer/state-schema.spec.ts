import {
    getComputationGroupByColumns,
    getComputationKeyColumns,
    getComputationStateNames,
    resolveKeySchema,
    resolveRowKeySchema,
} from './state-schema';
import type {FlowStateResultRow} from './types';
import type {FlowStaticSpec} from '../../../../../shared/yt-types';
import {
    collisionSpec,
    computationResolution,
    joinedSpec,
    joinerOverrideSpec,
    keyColumns,
    overrideColumns,
    overrideResolution,
    spec,
    wrappedJoinerOverrideSpec,
} from './state-test-fixtures';

describe('getComputationKeyColumns', () => {
    it('drops expression columns', () => {
        expect(getComputationKeyColumns(spec, 'state')).toEqual([keyColumns[1]]);
    });
    it('returns empty without computation', () => {
        expect(getComputationKeyColumns(spec, undefined)).toEqual([]);
    });
    it('unwraps an attributed table schema and drops expression columns', () => {
        const attributedSpec: FlowStaticSpec = {
            computations: {
                state: {
                    group_by_schema: {
                        $attributes: {strict: true, unique_keys: false},
                        $value: [
                            {name: 'Hash', type: 'uint64', expression: 'farm_hash(x)'},
                            {name: 'id', type: 'string'},
                        ],
                    },
                },
            },
        };
        expect(getComputationKeyColumns(attributedSpec, 'state')).toEqual([
            {name: 'id', type: 'string'},
        ]);
    });
    it('accepts an already-unwrapped array schema', () => {
        const arraySpec: FlowStaticSpec = {
            computations: {state: {group_by_schema: [{name: 'k', type: 'int64'}]}},
        };
        expect(getComputationKeyColumns(arraySpec, 'state')).toEqual([{name: 'k', type: 'int64'}]);
    });
    it('returns [] without throwing for malformed group_by_schema shapes', () => {
        const shapes: Array<unknown> = [undefined, null, {}, {$value: null}, {$value: 'x'}, []];
        for (const groupBySchema of shapes) {
            const brokenSpec = {
                computations: {state: {group_by_schema: groupBySchema}},
            } as unknown as FlowStaticSpec;
            expect(getComputationKeyColumns(brokenSpec, 'state')).toEqual([]);
        }
    });
});
describe('getComputationStateNames', () => {
    it('lists manager names only for the strict external target', () => {
        expect(getComputationStateNames(joinedSpec, 'state', 'external_key_state')).toEqual([
            '/state',
        ]);
    });
    it('unions manager and joiner names under the all target', () => {
        expect(getComputationStateNames(joinedSpec, 'state', 'all')).toEqual(['/state', '/joined']);
    });
    it('returns empty without computation', () => {
        expect(getComputationStateNames(joinedSpec, undefined, 'all')).toEqual([]);
    });
    it('unwraps attributed joiners instead of listing the annotation keys', () => {
        expect(getComputationStateNames(wrappedJoinerOverrideSpec, 'state', 'all')).toEqual([
            '/state',
            '/joined',
        ]);
    });
    it('ignores inherited computation, manager, and joiner declarations', () => {
        const inheritedComputations = Object.assign(
            Object.create({
                toString: {
                    group_by_schema: [{name: 'inherited', type: 'string'}],
                },
            }),
            {
                state: {
                    group_by_schema: [{name: 'key', type: 'string'}],
                    external_state_managers: Object.create({'/inherited-manager': {}}),
                    external_state_joiners: Object.create({'/inherited-joiner': {}}),
                },
            },
        ) as FlowStaticSpec['computations'];
        const inheritedSpec: FlowStaticSpec = {computations: inheritedComputations};

        expect(getComputationGroupByColumns(inheritedSpec, 'toString')).toEqual([]);
        expect(getComputationStateNames(inheritedSpec, 'state', 'all')).toEqual([]);
    });

    it('resolves own declarations named toString and __proto__', () => {
        const specialComputations = Object.fromEntries([
            ['toString', {group_by_schema: [{name: 'own', type: 'string'}]}],
            [
                '__proto__',
                {
                    external_state_managers: Object.fromEntries([['__proto__', {}]]),
                    external_state_joiners: Object.fromEntries([['toString', {}]]),
                },
            ],
        ]) as FlowStaticSpec['computations'];
        const specialSpec: FlowStaticSpec = {computations: specialComputations};

        expect(getComputationGroupByColumns(specialSpec, 'toString')).toEqual([
            {name: 'own', type: 'string'},
        ]);
        expect(getComputationStateNames(specialSpec, '__proto__', 'all')).toEqual([
            '__proto__',
            'toString',
        ]);
    });
});

describe('getComputationGroupByColumns', () => {
    it('keeps expression columns', () => {
        expect(getComputationGroupByColumns(spec, 'state')).toEqual(keyColumns);
    });
    it('returns empty without computation', () => {
        expect(getComputationGroupByColumns(spec, undefined)).toEqual([]);
    });
});

describe('resolveKeySchema declaration ownership', () => {
    it('does not let an inherited manager suppress an own joiner override', () => {
        const managers = Object.create({'/joined': {}}) as Record<string, unknown>;
        const specWithInheritedManager: FlowStaticSpec = {
            computations: {
                state: {
                    group_by_schema: [{name: 'base', type: 'string'}],
                    external_state_managers: managers,
                    external_state_joiners: {
                        '/joined': {
                            join_on: {key_schema_override: [{name: 'joined', type: 'string'}]},
                        },
                    },
                },
            },
        };

        expect(resolveKeySchema(specWithInheritedManager, 'state', '/joined', 'all')).toEqual({
            keyColumns: [{name: 'joined', type: 'string'}],
            allKeyColumns: [{name: 'joined', type: 'string'}],
            overrideActive: true,
        });
    });
});

describe('resolveKeySchema', () => {
    it.each(['all', 'external_key_state'] as const)(
        'applies the joiner override under the %s target and drops its expression columns',
        (target) => {
            expect(resolveKeySchema(joinerOverrideSpec, 'state', '/joined', target)).toEqual(
                overrideResolution,
            );
        },
    );
    it('reads an override wrapped in yson attributes at every level', () => {
        expect(resolveKeySchema(wrappedJoinerOverrideSpec, 'state', '/joined', 'all')).toEqual(
            overrideResolution,
        );
    });
    it('does not activate an inherited joiner override', () => {
        const inheritedJoiners = Object.create({
            '/joined': {join_on: {key_schema_override: overrideColumns}},
        });
        const inheritedSpec = {
            computations: {
                state: {group_by_schema: keyColumns, external_state_joiners: inheritedJoiners},
            },
        } as FlowStaticSpec;
        expect(resolveKeySchema(inheritedSpec, 'state', '/joined', 'all')).toEqual(
            computationResolution,
        );
    });
    it.each(['key_state', 'partition_state'] as const)(
        'keeps the computation schema under the internal %s target',
        (target) => {
            expect(resolveKeySchema(joinerOverrideSpec, 'state', '/joined', target)).toEqual(
                computationResolution,
            );
        },
    );
    it('keeps the computation schema for a joiner without an override', () => {
        expect(resolveKeySchema(joinerOverrideSpec, 'state', '/plain', 'all')).toEqual(
            computationResolution,
        );
        expect(resolveKeySchema(joinerOverrideSpec, 'state', '/streams-only', 'all')).toEqual(
            computationResolution,
        );
    });
    it('keeps the computation schema for manager, unknown and absent names', () => {
        expect(resolveKeySchema(joinerOverrideSpec, 'state', '/state', 'all')).toEqual(
            computationResolution,
        );
        expect(resolveKeySchema(joinerOverrideSpec, 'state', '/unknown', 'all')).toEqual(
            computationResolution,
        );
        expect(resolveKeySchema(joinerOverrideSpec, 'state', undefined, 'all')).toEqual(
            computationResolution,
        );
    });
    it('prefers the manager schema when a name is declared as both', () => {
        expect(resolveKeySchema(collisionSpec, 'state', '/both', 'all')).toEqual(
            computationResolution,
        );
    });
    it('resolves empty without a spec or computation', () => {
        expect(resolveKeySchema(undefined, 'state', '/joined', 'all')).toEqual({
            keyColumns: [],
            allKeyColumns: [],
            overrideActive: false,
        });
        expect(resolveKeySchema(joinerOverrideSpec, undefined, '/joined', 'all')).toEqual({
            keyColumns: [],
            allKeyColumns: [],
            overrideActive: false,
        });
    });
});

describe('resolveRowKeySchema', () => {
    const joinedRow: FlowStateResultRow = {
        section: 'joined_external_key_state',
        computationId: 'state',
        key: [42, 'ru'],
        stateName: '/joined',
        value: 1,
    };
    it('maps a joined override row through the joiner schema and pins its name', () => {
        expect(resolveRowKeySchema(joinerOverrideSpec, joinedRow)).toEqual({
            keyColumns: [overrideColumns[1]],
            allKeyColumns: overrideColumns,
            keySchemaStateName: '/joined',
        });
    });
    it('reads a wrapped override for a joined row', () => {
        expect(resolveRowKeySchema(wrappedJoinerOverrideSpec, joinedRow)).toEqual({
            keyColumns: [overrideColumns[1]],
            allKeyColumns: overrideColumns,
            keySchemaStateName: '/joined',
        });
    });
    it('maps a joined row without an override through the computation schema', () => {
        expect(
            resolveRowKeySchema(joinerOverrideSpec, {...joinedRow, stateName: '/plain'}),
        ).toEqual({
            keyColumns: [keyColumns[1]],
            allKeyColumns: keyColumns,
        });
    });
    it.each(['key_state', 'external_key_state'] as const)(
        'maps a %s row through the computation schema even when a joiner shares the name',
        (section) => {
            expect(resolveRowKeySchema(joinerOverrideSpec, {...joinedRow, section})).toEqual({
                keyColumns: [keyColumns[1]],
                allKeyColumns: keyColumns,
            });
        },
    );
    it('refuses to map a joined override row whose name is also a manager', () => {
        expect(resolveRowKeySchema(collisionSpec, {...joinedRow, stateName: '/both'})).toEqual({
            keyColumns: [],
            allKeyColumns: [],
        });
    });
});
