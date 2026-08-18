import {
    CLOSED_DELETE_DIALOG_STATE,
    INITIAL_READ_STATE,
    aggregateMatchedTotal,
    areAllCommitted,
    areOutcomesClean,
    buildCompactYsonSettings,
    buildHeavyHitterStateLink,
    buildRowDeleteBody,
    buildRowFilterUpdate,
    buildStateAccessBody,
    buildStateReadBody,
    castKeyValue,
    clampLimit,
    countCommitted,
    deleteStatesGate,
    flattenReadStatesResponse,
    flowDeleteDialogReducer,
    flowStateReadReducer,
    getAvailableStateTargets,
    getComputationGroupByColumns,
    getComputationKeyColumns,
    getComputationStateNames,
    getStateNameInputMode,
    getStateNameSelectItems,
    getStateRowId,
    isAnnotatedBigInteger,
    isDeletePreviewCommittable,
    isWriteDeniedByPermission,
    keyValuesFromRowKey,
    normalizeAnnotatedValue,
    normalizeReadStatesResponse,
    parseHeavyHitterKeyText,
    parseHeavyHitterStateSeed,
    reconcileStateName,
    reconcileStateTarget,
    resolveKeySchema,
    resolveRowKeySchema,
    resolveStateStoragePath,
    runRowDeletes,
    seedStateFilters,
    selectDeletableRows,
    serializeRawStateValue,
    splitHeavyHittersMessages,
    stringifyStateValue,
} from './helpers';
import type {
    FlowDeleteDialogState,
    FlowKeySchemaResolution,
    FlowStateFiltersValue,
    FlowStateResultRow,
} from './types';
import type {FlowDeleteStatesBody, FlowStaticSpec} from '../../../../../shared/yt-types';

const unipika = require('@gravity-ui/unipika/lib/unipika') as {
    formatFromYSON: (node: unknown, settings: Record<string, unknown>) => string;
};

const keyColumns = [
    {name: 'hash', type: 'uint64', expression: 'farm_hash(key)'},
    {name: 'key', type: 'uint64'},
];

const spec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/state': {}},
        },
    },
};

const joinedSpec: FlowStaticSpec = {
    computations: {
        state: {
            group_by_schema: keyColumns,
            external_state_managers: {'/state': {}},
            external_state_joiners: {'/joined': {}, '/state': {}},
        },
    },
};

function filters(overrides: Partial<FlowStateFiltersValue>): FlowStateFiltersValue {
    return {keyValues: {}, target: 'all', limit: 10, ...overrides};
}

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
            expect(() => getComputationKeyColumns(brokenSpec, 'state')).not.toThrow();
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
    it('dedupes a name declared as both manager and joiner', () => {
        expect(
            getComputationStateNames(joinedSpec, 'state', 'all').filter(
                (name) => name === '/state',
            ),
        ).toEqual(['/state']);
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
});

describe('getAvailableStateTargets', () => {
    it('leaves every target available without a chosen computation', () => {
        expect(getAvailableStateTargets(joinedSpec, undefined)).toEqual({
            all: true,
            key_state: true,
            partition_state: true,
            external_key_state: true,
        });
    });
    it('marks every kind available for a computation declaring all of them', () => {
        expect(getAvailableStateTargets(joinedSpec, 'state')).toEqual({
            all: true,
            key_state: true,
            partition_state: true,
            external_key_state: true,
        });
    });
    it('disables kinds the computation does not declare', () => {
        const bareSpec: FlowStaticSpec = {computations: {state: {}}};
        expect(getAvailableStateTargets(bareSpec, 'state')).toEqual({
            all: true,
            key_state: false,
            partition_state: false,
            external_key_state: false,
        });
    });
});

describe('reconcileStateTarget', () => {
    it('keeps the target when the new computation still declares it', () => {
        expect(reconcileStateTarget(joinedSpec, 'state', 'external_key_state')).toBe(
            'external_key_state',
        );
    });
    it('falls back to all when the new computation no longer declares the target', () => {
        const bareSpec: FlowStaticSpec = {computations: {state: {}}};
        expect(reconcileStateTarget(bareSpec, 'state', 'external_key_state')).toBe('all');
    });
    it('leaves all untouched regardless of the computation', () => {
        const bareSpec: FlowStaticSpec = {computations: {state: {}}};
        expect(reconcileStateTarget(bareSpec, 'state', 'all')).toBe('all');
    });
});

describe('castKeyValue', () => {
    it('casts small integers to numbers and 64-bit integers to annotated values', () => {
        expect(castKeyValue({name: 'k', type: 'int32'}, '42')).toEqual({value: 42});
        expect(castKeyValue({name: 'k', type: 'uint64'}, '42')).toEqual({
            value: {$type: 'uint64', $value: '42'},
        });
    });
    it('accepts a key past 2^53 without precision loss', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '9007199254740993')).toEqual({
            value: {$type: 'uint64', $value: '9007199254740993'},
        });
    });
    it('rejects non-integers with a translatable error identifier', () => {
        expect(castKeyValue({name: 'k', type: 'int64'}, 'abc')).toEqual({
            error: {errorKey: 'validation_expects-integer', params: {name: 'k', type: 'int64'}},
        });
    });
    it('keeps strings verbatim', () => {
        expect(castKeyValue({name: 'k', type: 'string'}, ' a b ')).toEqual({value: ' a b '});
    });
    it('casts booleans', () => {
        expect(castKeyValue({name: 'k', type: 'boolean'}, 'true')).toEqual({value: true});
    });
    it('rejects a negative value for unsigned integers', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '-1')).toHaveProperty('error');
    });
    it('keeps negatives for signed integers', () => {
        expect(castKeyValue({name: 'k', type: 'int32'}, '-1')).toEqual({value: -1});
        expect(castKeyValue({name: 'k', type: 'int64'}, '-1')).toEqual({
            value: {$type: 'int64', $value: '-1'},
        });
    });
    it('rejects non-numeric doubles', () => {
        expect(castKeyValue({name: 'k', type: 'double'}, 'abc')).toHaveProperty('error');
        expect(castKeyValue({name: 'k', type: 'float'}, 'abc')).toHaveProperty('error');
    });
    it('rejects empty input with a translatable error identifier', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '   ')).toEqual({
            error: {errorKey: 'validation_empty-key-value', params: {name: 'k'}},
        });
    });
    it('rejects an invalid boolean', () => {
        expect(castKeyValue({name: 'k', type: 'boolean'}, 'yes')).toHaveProperty('error');
    });
    it.each([
        ['int8', '127'],
        ['int8', '-128'],
        ['uint8', '255'],
        ['int16', '32767'],
        ['uint16', '65535'],
        ['int32', '2147483647'],
        ['int32', '-2147483648'],
        ['uint32', '4294967295'],
    ])('accepts %s in-range boundary %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({value: Number(raw)});
    });
    it.each([
        ['int8', '128'],
        ['int8', '-129'],
        ['uint8', '256'],
        ['int16', '32768'],
        ['uint16', '65536'],
        ['int32', '2147483648'],
        ['uint32', '4294967296'],
    ])('rejects %s just out of range %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({
            error: {errorKey: 'validation_integer-out-of-range', params: {name: 'k', type}},
        });
    });
    it.each([
        ['int64', '9223372036854775807'],
        ['int64', '-9223372036854775808'],
        ['uint64', '18446744073709551615'],
    ])('accepts the full %s range boundary %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({
            value: {$type: type, $value: raw},
        });
    });
    it.each([
        ['int64', '9223372036854775808'],
        ['int64', '-9223372036854775809'],
        ['uint64', '18446744073709551616'],
    ])('rejects %s just past the boundary %s', (type, raw) => {
        expect(castKeyValue({name: 'k', type}, raw)).toEqual({
            error: {errorKey: 'validation_integer-out-of-range', params: {name: 'k', type}},
        });
    });
    it('normalizes leading zeros in 64-bit keys', () => {
        expect(castKeyValue({name: 'k', type: 'uint64'}, '007')).toEqual({
            value: {$type: 'uint64', $value: '7'},
        });
    });
    it('rejects non-finite floats', () => {
        expect(castKeyValue({name: 'k', type: 'double'}, 'Infinity')).toHaveProperty('error');
        expect(castKeyValue({name: 'k', type: 'double'}, '1e400')).toHaveProperty('error');
        expect(castKeyValue({name: 'k', type: 'float'}, '-Infinity')).toHaveProperty('error');
    });
    it('accepts a finite float', () => {
        expect(castKeyValue({name: 'k', type: 'double'}, '1.5')).toEqual({value: 1.5});
    });
});

describe('buildStateAccessBody', () => {
    it('requires a scope with a translatable error identifier', () => {
        expect(buildStateAccessBody(filters({}), [])).toEqual({
            error: {errorKey: 'validation_no-scope'},
        });
    });
    it('maps partition mode and ignores computation', () => {
        expect(buildStateAccessBody(filters({partitionId: 'p1', computationId: 'c1'}), [])).toEqual(
            {body: {partition_id: 'p1'}},
        );
    });
    it('maps computation mode with key and name', () => {
        expect(
            buildStateAccessBody(
                filters({
                    computationId: 'state',
                    keyValues: {key: '7'},
                    stateName: '/state',
                    target: 'key_state',
                }),
                [keyColumns[1]],
            ),
        ).toEqual({
            body: {
                computation_id: 'state',
                key: {key: {$type: 'uint64', $value: '7'}},
                name: '/state',
                target: 'key_state',
            },
        });
    });
    it('omits target=all', () => {
        expect(buildStateAccessBody(filters({computationId: 'c1'}), [])).toEqual({
            body: {computation_id: 'c1'},
        });
    });
    it('rejects key with partition_state target', () => {
        expect(
            buildStateAccessBody(
                filters({
                    computationId: 'state',
                    keyValues: {key: '7'},
                    target: 'partition_state',
                }),
                [keyColumns[1]],
            ),
        ).toEqual({error: {errorKey: 'validation_key-target-mismatch'}});
    });
    it('rejects partially filled keys', () => {
        expect(
            buildStateAccessBody(filters({computationId: 'state', keyValues: {a: '1'}}), [
                {name: 'a', type: 'uint64'},
                {name: 'b', type: 'uint64'},
            ]),
        ).toEqual({error: {errorKey: 'validation_fill-all-keys'}});
    });
    it.each(['key_state', 'partition_state', 'external_key_state'] as const)(
        'scopes the request to the %s target the backend accepts',
        (target) => {
            expect(buildStateAccessBody(filters({computationId: 'c1', target}), [])).toEqual({
                body: {computation_id: 'c1', target},
            });
        },
    );
    it('sends the name filter as "name" — the field the backend reads', () => {
        const built = buildStateAccessBody(
            filters({computationId: 'c1', target: 'key_state', stateName: '/key_state'}),
            [],
        );
        expect(built).toEqual({
            body: {computation_id: 'c1', target: 'key_state', name: '/key_state'},
        });
        expect(built).not.toHaveProperty('body.state_name');
    });
    it('narrows a delete by a free-form name even when no external manager is declared', () => {
        expect(
            buildStateAccessBody(
                filters({computationId: 'c1', target: 'partition_state', stateName: '/partition'}),
                [],
            ),
        ).toEqual({body: {computation_id: 'c1', target: 'partition_state', name: '/partition'}});
    });
    it('carries a key past 2^53 into the body as an annotated value, never a lossy number', () => {
        const built = buildStateAccessBody(
            filters({
                computationId: 'state',
                keyValues: {key: '9007199254740993'},
                target: 'key_state',
            }),
            [keyColumns[1]],
        );
        expect(built).toEqual({
            body: {
                computation_id: 'state',
                key: {key: {$type: 'uint64', $value: '9007199254740993'}},
                target: 'key_state',
            },
        });
    });
});

describe('getStateNameInputMode', () => {
    it('constrains the name to declared managers only for external_key_state', () => {
        expect(getStateNameInputMode('external_key_state')).toBe('declared-only');
    });
    it('suggests known names under the all target', () => {
        expect(getStateNameInputMode('all')).toBe('suggested');
    });
    it.each(['key_state', 'partition_state'] as const)(
        'takes a free-form name for the %s target',
        (target) => {
            expect(getStateNameInputMode(target)).toBe('free-form');
        },
    );
});

describe('reconcileStateName', () => {
    it('drops a free-form name that external_key_state cannot address', () => {
        expect(reconcileStateName('/key_state', 'external_key_state', ['/ext'])).toBeUndefined();
    });
    it('keeps a declared manager name under external_key_state', () => {
        expect(reconcileStateName('/ext', 'external_key_state', ['/ext'])).toBe('/ext');
    });
    it('keeps a free-form name when the target still accepts one', () => {
        expect(reconcileStateName('/anything', 'key_state', [])).toBe('/anything');
    });
    it('keeps a joiner name under the all target that reaches the joined section', () => {
        expect(reconcileStateName('/joined', 'all', ['/state', '/joined'])).toBe('/joined');
    });
    it('drops a joiner-only name when entering the strict external target', () => {
        expect(reconcileStateName('/joined', 'external_key_state', ['/state'])).toBeUndefined();
    });
});

describe('getStateNameSelectItems', () => {
    it('appends the active name so the select always displays it', () => {
        expect(getStateNameSelectItems(['/a'], '/typed')).toEqual(['/a', '/typed']);
    });
    it('does not duplicate a known name', () => {
        expect(getStateNameSelectItems(['/a'], '/a')).toEqual(['/a']);
    });
    it('returns the known names without a current value', () => {
        expect(getStateNameSelectItems(['/a'], undefined)).toEqual(['/a']);
    });
});

describe('seedStateFilters', () => {
    it('binds the load/delete body to the current fixed computation, never a stale one', () => {
        expect(buildStateAccessBody(seedStateFilters('compA', undefined), [])).toEqual({
            body: {computation_id: 'compA'},
        });
        expect(buildStateAccessBody(seedStateFilters('compB', undefined), [])).toEqual({
            body: {computation_id: 'compB'},
        });
    });
    it('prefers the fixed computation over the initial one', () => {
        expect(seedStateFilters('fixed', {computationId: 'initial'}).computationId).toBe('fixed');
    });
    it('falls back to the initial computation when none is fixed', () => {
        expect(seedStateFilters(undefined, {computationId: 'initial'}).computationId).toBe(
            'initial',
        );
    });
});

describe('flattenReadStatesResponse', () => {
    it('flattens all sections into rows', () => {
        const rows = flattenReadStatesResponse({
            key_states: [{computation_id: 'c', key: [7], states: {'/s': 1, '/t': 2}}],
            partition_states: [{partition_id: 'p', computation_id: 'c', states: {'/u': 3}}],
            external_key_states: [{computation_id: 'c', key: [8], states: {'/x': 4}}],
        });
        expect(rows).toHaveLength(4);
        expect(rows[0]).toMatchObject({section: 'key_state', stateName: '/s', value: 1});
        expect(rows[2]).toMatchObject({section: 'partition_state', partitionId: 'p'});
        expect(rows[3]).toMatchObject({section: 'external_key_state', value: 4});
    });
    it('flattens joined external key states', () => {
        const rows = flattenReadStatesResponse({
            joined_external_key_states: [{computation_id: 'c', key: [9], states: {'/j': 5}}],
        });
        expect(rows).toEqual([
            {
                section: 'joined_external_key_state',
                computationId: 'c',
                partitionId: undefined,
                key: [9],
                stateName: '/j',
                value: 5,
            },
        ]);
    });
    it('handles undefined', () => {
        expect(flattenReadStatesResponse(undefined)).toEqual([]);
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

describe('keyValuesFromRowKey', () => {
    const columns = [
        {name: 'user', type: 'uint64'},
        {name: 'flag', type: 'boolean'},
    ];
    const allColumns = [{name: 'hash', type: 'uint64', expression: 'farm_hash(user)'}, ...columns];
    it('maps a positional key without expression columns', () => {
        expect(keyValuesFromRowKey([7, true], columns, allColumns)).toEqual({
            user: '7',
            flag: 'true',
        });
    });
    it('maps a positional key that includes expression columns', () => {
        expect(keyValuesFromRowKey([123, 7, false], columns, allColumns)).toEqual({
            user: '7',
            flag: 'false',
        });
    });
    it('maps an object key by column names', () => {
        expect(keyValuesFromRowKey({user: 7, flag: true}, columns, allColumns)).toEqual({
            user: '7',
            flag: 'true',
        });
    });
    it('maps a scalar onto a single-column key', () => {
        expect(keyValuesFromRowKey(7, [columns[0]], [columns[0]])).toEqual({user: '7'});
    });
    it('rejects unmappable keys', () => {
        expect(keyValuesFromRowKey([7], columns, allColumns)).toBeUndefined();
        expect(keyValuesFromRowKey({user: 7}, columns, allColumns)).toBeUndefined();
        expect(keyValuesFromRowKey(undefined, columns, allColumns)).toBeUndefined();
        expect(keyValuesFromRowKey([7, true], [], [])).toBeUndefined();
        expect(
            keyValuesFromRowKey(
                [1, 2, 3],
                [columns[0]],
                [{name: 'hash', type: 'uint64', expression: 'e'}, columns[0], columns[1]],
            ),
        ).toBeUndefined();
        expect(keyValuesFromRowKey(7, columns, allColumns)).toBeUndefined();
    });
});

describe('buildRowFilterUpdate', () => {
    const columns = [{name: 'user', type: 'uint64'}];
    const context = {
        keyColumns: columns,
        allKeyColumns: columns,
        stateNames: ['/s'],
        fixedComputationId: undefined,
    };
    const row: FlowStateResultRow = {
        section: 'key_state',
        computationId: 'c2',
        key: [7],
        stateName: '/s',
        value: 1,
    };
    it('applies the row state kind as the target filter', () => {
        const next = buildRowFilterUpdate(filters({computationId: 'c1'}), row, 'target', context);
        expect(next).toMatchObject({target: 'key_state'});
    });
    it('does not offer a target update for joined rows', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1'}),
                {...row, section: 'joined_external_key_state'},
                'target',
                context,
            ),
        ).toBeUndefined();
    });
    it('refuses a no-op target update', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1', target: 'key_state'}),
                row,
                'target',
                context,
            ),
        ).toBeUndefined();
    });
    it('clears key values when switching the target to partition state', () => {
        const next = buildRowFilterUpdate(
            filters({computationId: 'c1', keyValues: {user: '7'}}),
            {...row, section: 'partition_state', partitionId: 'p'},
            'target',
            context,
        );
        expect(next).toMatchObject({target: 'partition_state', keyValues: {}});
    });
    it('switches the computation filter and resets its dependents', () => {
        const next = buildRowFilterUpdate(
            filters({computationId: 'c1', partitionId: 'p', stateName: '/s'}),
            row,
            'computation',
            context,
        );
        expect(next).toEqual(
            filters({
                computationId: 'c2',
                partitionId: undefined,
                keyValues: {},
                stateName: undefined,
            }),
        );
    });
    it('refuses a computation update when the tab pins another computation', () => {
        expect(
            buildRowFilterUpdate(filters({computationId: 'c1'}), row, 'computation', {
                ...context,
                fixedComputationId: 'c1',
            }),
        ).toBeUndefined();
    });
    it('refuses a no-op computation update', () => {
        expect(
            buildRowFilterUpdate(filters({computationId: 'c2'}), row, 'computation', context),
        ).toBeUndefined();
    });
    it('applies the row key together with its computation', () => {
        const next = buildRowFilterUpdate(
            filters({computationId: 'c1', partitionId: 'p', target: 'partition_state'}),
            row,
            'key',
            context,
        );
        expect(next).toMatchObject({
            computationId: 'c2',
            partitionId: undefined,
            keyValues: {user: '7'},
            target: 'all',
        });
    });
    it('refuses a key update when the key cannot be mapped', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1'}),
                {...row, key: [1, 2, 3]},
                'key',
                context,
            ),
        ).toBeUndefined();
    });
    it('refuses a key update on a row without a computation', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1'}),
                {...row, computationId: undefined},
                'key',
                context,
            ),
        ).toBeUndefined();
    });
    it('refuses a key update whose computation differs from the pinned one', () => {
        expect(
            buildRowFilterUpdate(filters({computationId: 'c1'}), row, 'key', {
                ...context,
                fixedComputationId: 'c1',
            }),
        ).toBeUndefined();
    });
    it('applies the state name', () => {
        const next = buildRowFilterUpdate(
            filters({computationId: 'c1'}),
            row,
            'stateName',
            context,
        );
        expect(next).toMatchObject({stateName: '/s'});
    });
    it('refuses a no-op state name update', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1', stateName: '/s'}),
                row,
                'stateName',
                context,
            ),
        ).toBeUndefined();
    });
});

describe('getStateRowId', () => {
    it('builds a stable identity from row coordinates', () => {
        expect(
            getStateRowId({
                section: 'key_state',
                computationId: 'c',
                key: [7],
                stateName: '/s',
                value: 1,
            }),
        ).toBe('key_state|c||[7]|/s');
    });
    it('distinguishes rows that differ only by section', () => {
        const base = {computationId: 'c', key: [7], stateName: '/s', value: 1} as const;
        expect(getStateRowId({...base, section: 'key_state'})).not.toBe(
            getStateRowId({...base, section: 'external_key_state'}),
        );
    });
});

describe('buildRowDeleteBody', () => {
    it('addresses a key state row by computation, key and name', () => {
        expect(
            buildRowDeleteBody({
                section: 'key_state',
                computationId: 'c',
                key: {user: 7},
                stateName: '/s',
                value: 1,
            }),
        ).toEqual({computation_id: 'c', key: {user: 7}, name: '/s', target: 'key_state'});
    });
    it('addresses an external key state row with its own target', () => {
        expect(
            buildRowDeleteBody({
                section: 'external_key_state',
                computationId: 'c',
                key: [7],
                stateName: '/x',
                value: 1,
            }),
        ).toEqual({computation_id: 'c', key: [7], name: '/x', target: 'external_key_state'});
    });
    it('addresses a partition state row by partition and name', () => {
        expect(
            buildRowDeleteBody({
                section: 'partition_state',
                computationId: 'c',
                partitionId: 'p',
                stateName: '/p',
                value: 1,
            }),
        ).toEqual({partition_id: 'p', name: '/p', target: 'partition_state'});
    });
    it('refuses a joined external key state row instead of addressing key_state', () => {
        expect(() =>
            buildRowDeleteBody({
                section: 'joined_external_key_state',
                computationId: 'c',
                key: [7],
                stateName: '/s',
                value: 1,
            }),
        ).toThrow(/joined_external_key_state/);
    });
});

describe('selectDeletableRows', () => {
    const keyRow: FlowStateResultRow = {
        section: 'key_state',
        computationId: 'c',
        key: [7],
        stateName: '/s',
        value: 1,
    };
    const joinedRow: FlowStateResultRow = {...keyRow, section: 'joined_external_key_state'};
    it('keeps the selected deletable rows', () => {
        expect(selectDeletableRows([keyRow, joinedRow], {[getStateRowId(keyRow)]: true})).toEqual([
            keyRow,
        ]);
    });
    it('drops a joined row a shift-range selection swept in alongside a deletable row', () => {
        expect(
            selectDeletableRows([keyRow, joinedRow], {
                [getStateRowId(keyRow)]: true,
                [getStateRowId(joinedRow)]: true,
            }),
        ).toEqual([keyRow]);
    });
    it('ignores unselected rows', () => {
        expect(selectDeletableRows([keyRow, joinedRow], {})).toEqual([]);
    });
});

describe('runRowDeletes', () => {
    const keyRow: FlowStateResultRow = {
        section: 'key_state',
        computationId: 'c',
        key: {user: 1},
        stateName: '/s',
        value: 1,
    };
    const partitionRow: FlowStateResultRow = {
        section: 'partition_state',
        computationId: 'c',
        partitionId: 'p',
        stateName: '/p',
        value: 2,
    };
    it('runs sequentially and aggregates outcomes', async () => {
        const calls: Array<FlowDeleteStatesBody> = [];
        const execute = jest.fn(async (body: FlowDeleteStatesBody) => {
            calls.push(body);
            return {committed: true};
        });
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: false,
            commit: true,
        });
        expect(outcomes).toHaveLength(2);
        expect(outcomes.every((outcome) => outcome.error === undefined)).toBe(true);
        expect(calls[0]).toEqual({
            computation_id: 'c',
            key: {user: 1},
            name: '/s',
            target: 'key_state',
            force: false,
            commit: true,
        });
        expect(calls[1]).toEqual({
            partition_id: 'p',
            name: '/p',
            target: 'partition_state',
            force: false,
            commit: true,
        });
    });
    it('never issues a delete for a joined row that slipped into the selection', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        const outcomes = await runRowDeletes(
            [{...keyRow, section: 'joined_external_key_state'}, keyRow],
            execute,
            {force: false, commit: true},
        );
        expect(execute).not.toHaveBeenCalled();
        expect(outcomes).toHaveLength(1);
        expect(outcomes[0].error).toBeInstanceOf(Error);
    });
    it('stops at the first failed commit', async () => {
        const execute = jest
            .fn()
            .mockResolvedValueOnce({committed: false, errors: ['boom']})
            .mockResolvedValue({committed: true});
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: false,
            commit: true,
        });
        expect(outcomes).toHaveLength(1);
        expect(execute).toHaveBeenCalledTimes(1);
    });
    it('collects every preview even when one carries errors', async () => {
        const execute = jest
            .fn()
            .mockResolvedValueOnce({committed: false, errors: ['boom']})
            .mockResolvedValue({committed: false});
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: false,
            commit: false,
        });
        expect(outcomes).toHaveLength(2);
        expect(areOutcomesClean(outcomes)).toBe(false);
    });
    it('stops at a rejected call and records the error', async () => {
        const execute = jest.fn().mockRejectedValue(new Error('denied'));
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: true,
            commit: false,
        });
        expect(outcomes).toHaveLength(1);
        expect(outcomes[0].error).toBeInstanceOf(Error);
    });
    it('stops when cancelled', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: false,
            commit: true,
            isCancelled: () => true,
        });
        expect(outcomes).toEqual([]);
        expect(execute).not.toHaveBeenCalled();
    });
});

describe('delete outcome aggregation', () => {
    it('sums matched totals across per-row responses', () => {
        expect(
            aggregateMatchedTotal([
                {rowId: 'a', response: {matched_states: {key_states: {total: 2}}}},
                {rowId: 'b', response: {matched_states: {external_key_states: {total: 3}}}},
                {rowId: 'c', error: new Error('x')},
            ]),
        ).toBe(5);
    });
    it('sums the partition bucket and treats missing matched_states as zero', () => {
        expect(
            aggregateMatchedTotal([
                {rowId: 'a', response: {matched_states: {partition_states: {total: 4}}}},
                {rowId: 'b', response: {}},
            ]),
        ).toBe(4);
    });
    it('reports all-committed only for a full clean run', () => {
        const committed = {rowId: 'a', response: {committed: true}};
        expect(areAllCommitted([committed, {rowId: 'b', response: {committed: true}}], 2)).toBe(
            true,
        );
        expect(areAllCommitted([committed], 2)).toBe(false);
        expect(areAllCommitted([committed, {rowId: 'b', response: {committed: false}}], 2)).toBe(
            false,
        );
    });
    it('counts committed rows for partial-failure reporting', () => {
        expect(
            countCommitted([
                {rowId: 'a', response: {committed: true}},
                {rowId: 'b', response: {committed: true, errors: ['boom']}},
                {rowId: 'c', error: new Error('x')},
            ]),
        ).toBe(1);
    });
});

describe('resolveStateStoragePath', () => {
    const pipelinePath = '//home/pipeline';
    const specWithExternal: FlowStaticSpec = {
        computations: {
            c: {
                external_state_managers: {
                    '/profile': {
                        $attributes: {},
                        $value: {
                            parameters: {
                                path: {$attributes: {cluster: 'seneca'}, $value: '//home/profiles'},
                            },
                        },
                    },
                },
                external_state_joiners: {
                    '/joined': {parameters: {path: '//home/joined'}},
                },
            },
        },
    };
    const baseRow = {computationId: 'c', stateName: '/profile', value: 1};
    it('maps internal key rows to the pipeline states table', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'key_state', key: [1]},
                pipelinePath,
                undefined,
            ),
        ).toEqual({path: '//home/pipeline/states'});
    });
    it('maps internal partition rows to the partition states table', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'partition_state', partitionId: 'p'},
                pipelinePath,
                undefined,
            ),
        ).toEqual({path: '//home/pipeline/partition_states'});
    });
    it('resolves an external manager path with its cluster attribute', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', key: [1]},
                pipelinePath,
                specWithExternal,
            ),
        ).toEqual({path: '//home/profiles', cluster: 'seneca'});
    });
    it('resolves a joiner path', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'joined_external_key_state', stateName: '/joined', key: [1]},
                pipelinePath,
                specWithExternal,
            ),
        ).toEqual({path: '//home/joined', cluster: undefined});
    });
    it('omits the link when no path resolves', () => {
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', stateName: '/missing', key: [1]},
                pipelinePath,
                specWithExternal,
            ),
        ).toBeUndefined();
        expect(
            resolveStateStoragePath(
                {...baseRow, section: 'external_key_state', key: [1]},
                pipelinePath,
                undefined,
            ),
        ).toBeUndefined();
    });
});

describe('deleteStatesGate', () => {
    it.each(['Stopped', 'Completed'] as const)('deletes from %s without force', (state) => {
        expect(deleteStatesGate(state)).toEqual({blocked: false, requiresForce: false});
    });
    it('requires force from Paused, the only force-unlockable state', () => {
        expect(deleteStatesGate('Paused')).toEqual({blocked: false, requiresForce: true});
    });
    it.each(['Pausing', 'Working', 'Draining', 'Unknown'] as const)(
        'blocks %s outright — force must not unlock it',
        (state) => {
            expect(deleteStatesGate(state)).toEqual({blocked: true, requiresForce: false});
        },
    );
    it('blocks without a known state', () => {
        expect(deleteStatesGate(undefined)).toEqual({blocked: true, requiresForce: false});
    });
});

describe('isWriteDeniedByPermission', () => {
    it('permits deletion only on an explicit allow action', () => {
        expect(isWriteDeniedByPermission({data: {action: 'allow'}})).toBe(false);
    });
    it('denies on an explicit deny action', () => {
        expect(isWriteDeniedByPermission({data: {action: 'deny'}})).toBe(true);
    });
    it('fails closed when the permission check resolves with an error envelope', () => {
        expect(isWriteDeniedByPermission({})).toBe(true);
    });
});

describe('isDeletePreviewCommittable', () => {
    const snapshot = {bodyKey: 'b', force: false};
    const cleanOutcome = {rowId: 'r1', response: {committed: false}};
    it('is committable for a clean preview matching the current rows and force', () => {
        expect(isDeletePreviewCommittable([cleanOutcome], snapshot, 'b', false)).toBe(true);
    });
    it('is not committable when any outcome carries errors', () => {
        expect(
            isDeletePreviewCommittable(
                [{rowId: 'r1', response: {errors: ['boom']}}],
                snapshot,
                'b',
                false,
            ),
        ).toBe(false);
        expect(
            isDeletePreviewCommittable(
                [{rowId: 'r1', error: new Error('x')}],
                snapshot,
                'b',
                false,
            ),
        ).toBe(false);
    });
    it('is not committable without a preview', () => {
        expect(isDeletePreviewCommittable(undefined, snapshot, 'b', false)).toBe(false);
    });
    it('is not committable when the snapshot rows or force drifted', () => {
        expect(isDeletePreviewCommittable([cleanOutcome], snapshot, 'other', false)).toBe(false);
        expect(isDeletePreviewCommittable([cleanOutcome], snapshot, 'b', true)).toBe(false);
    });
});

describe('clampLimit', () => {
    it('keeps values inside the range', () => {
        expect(clampLimit(25)).toBe(25);
    });
    it('clamps below one and above the maximum', () => {
        expect(clampLimit(0)).toBe(1);
        expect(clampLimit(-5)).toBe(1);
        expect(clampLimit(50000)).toBe(10000);
    });
    it('falls back to the default for NaN', () => {
        expect(clampLimit(Number.NaN)).toBe(10);
    });
    it('truncates fractional values', () => {
        expect(clampLimit(3.9)).toBe(3);
    });
});

describe('stringifyStateValue', () => {
    it('serializes scalars and objects', () => {
        expect(stringifyStateValue(7)).toBe('7');
        expect(stringifyStateValue({a: 1})).toBe('{"a":1}');
    });
    it('truncates past the limit', () => {
        expect(stringifyStateValue('x'.repeat(300))).toHaveLength(201);
    });
    it('returns an empty string for undefined', () => {
        expect(stringifyStateValue(undefined)).toBe('');
    });
});

describe('serializeRawStateValue', () => {
    it('serializes scalars, objects and arrays', () => {
        expect(serializeRawStateValue(7)).toBe('7');
        expect(serializeRawStateValue({a: 1})).toBe('{"a":1}');
        expect(serializeRawStateValue([1, 'x'])).toBe('[1,"x"]');
    });
    it('never truncates', () => {
        const long = 'x'.repeat(300);
        expect(serializeRawStateValue(long)).toBe(JSON.stringify(long));
    });
    it('returns an empty string for undefined', () => {
        expect(serializeRawStateValue(undefined)).toBe('');
    });
});

describe('buildCompactYsonSettings', () => {
    it('renders a realistic multi-key state value with no multi-space indentation runs', () => {
        const value = {
            alignment_timestamp_memory: {inflight_keys: []},
            avg_offset_byte_size: 4957.481529702713,
            committed_offset_exclusive: 3925236713,
            committed_offset_exclusive_v2: [3925236713],
            last_idle_instant: '1970-01-01T00:00:00.000000Z',
            max_offset_is_confirmed: false,
            offset_memory: {inflight_keys: []},
        };

        const settings = buildCompactYsonSettings({
            format: 'json',
            showDecoded: true,
            compact: false,
            escapeWhitespace: true,
            binaryAsHex: true,
            asHTML: false,
        } as Parameters<typeof buildCompactYsonSettings>[0]);

        const formatted = unipika.formatFromYSON(value, settings);

        expect(formatted).not.toMatch(/[ \u00a0]{2,}/);
        expect(formatted).not.toContain('\n');
    });
});

describe('flowStateReadReducer', () => {
    const scopeA = {key_states: [{computation_id: 'A', key: [1], states: {'/s': 1}}]};
    const scopeB = {key_states: [{computation_id: 'B', key: [2], states: {'/s': 2}}]};

    it('renders a response that still belongs to the filters on screen', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        expect(state.response).toEqual(scopeA);
        expect(state.loadingRequestId).toBeUndefined();
    });

    it('never renders a superseded response as the new scope result', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'filters-changed',
            hasScope: true,
            requestId: 2,
        });
        state = flowStateReadReducer(state, {type: 'load-started', requestId: 3});
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 3,
            response: scopeB,
        });
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        expect(state.response).toEqual(scopeB);
    });

    it('drops a late error raised for filters the user already left', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'filters-changed',
            hasScope: true,
            requestId: 2,
        });
        state = flowStateReadReducer(state, {
            type: 'load-failed',
            requestId: 1,
            error: new Error('scope A failed'),
        });
        expect(state.error).toBeUndefined();
    });

    it('keeps the previous rows while new filters are being debounced', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        state = flowStateReadReducer(state, {
            type: 'filters-changed',
            hasScope: true,
            requestId: 2,
        });
        expect(state.response).toEqual(scopeA);
        expect(state.error).toBeUndefined();
        expect(state.loadingRequestId).toBeUndefined();
    });

    it('keeps the previous rows while the next load is in flight', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        state = flowStateReadReducer(state, {
            type: 'filters-changed',
            hasScope: true,
            requestId: 2,
        });
        state = flowStateReadReducer(state, {type: 'load-started', requestId: 2});
        expect(state.response).toEqual(scopeA);
        expect(state.loadingRequestId).toBe(state.requestId);
    });

    it('drops the rows when the scope is cleared', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        state = flowStateReadReducer(state, {
            type: 'filters-changed',
            hasScope: false,
            requestId: 2,
        });
        expect(state.response).toBeUndefined();
    });

    it('replaces the retained rows with a hard error', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        state = flowStateReadReducer(state, {type: 'load-started', requestId: 2});
        state = flowStateReadReducer(state, {
            type: 'load-failed',
            requestId: 2,
            error: new Error('hard failure'),
        });
        expect(state.response).toBeUndefined();
        expect(state.error).toBeDefined();
        expect(state.loadingRequestId).toBeUndefined();
    });

    it('keeps the newer response when two same-revision requests resolve out of order', () => {
        let state = flowStateReadReducer(INITIAL_READ_STATE, {type: 'load-started', requestId: 1});
        const revisionBeforeSecondRequest = state.revision;
        state = flowStateReadReducer(state, {type: 'load-started', requestId: 2});
        expect(state.revision).toBe(revisionBeforeSecondRequest);
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 2,
            response: scopeB,
        });
        state = flowStateReadReducer(state, {
            type: 'load-succeeded',
            requestId: 1,
            response: scopeA,
        });
        expect(state.response).toEqual(scopeB);
    });
});

describe('flowDeleteDialogReducer', () => {
    const bodyKey = '["key_state|c1|||/s"]';
    const snapshot = {bodyKey, force: false};
    const cleanOutcomes = [{rowId: 'key_state|c1|||/s', response: {committed: false}}];

    function deleteArmed(state: FlowDeleteDialogState): boolean {
        return isDeletePreviewCommittable(
            state.preview,
            state.previewSnapshot,
            bodyKey,
            state.force,
        );
    }

    function openedAndPreviewing(session: number): FlowDeleteDialogState {
        let state = flowDeleteDialogReducer(CLOSED_DELETE_DIALOG_STATE, {type: 'opened', session});
        state = flowDeleteDialogReducer(state, {
            type: 'pipeline-state-loaded',
            session,
            pipelineState: 'Stopped',
        });
        return flowDeleteDialogReducer(state, {type: 'run-started', commit: false});
    }

    it('arms Delete once a preview settles inside the session that asked for it', () => {
        const state = flowDeleteDialogReducer(openedAndPreviewing(1), {
            type: 'preview-loaded',
            session: 1,
            outcomes: cleanOutcomes,
            snapshot,
        });
        expect(deleteArmed(state)).toBe(true);
    });

    it('leaves Delete disarmed when a preview from a closed session settles after reopen', () => {
        let state = openedAndPreviewing(1);
        state = flowDeleteDialogReducer(state, {type: 'closed', session: 2});
        state = flowDeleteDialogReducer(state, {type: 'opened', session: 3});
        state = flowDeleteDialogReducer(state, {
            type: 'pipeline-state-loaded',
            session: 3,
            pipelineState: 'Stopped',
        });
        state = flowDeleteDialogReducer(state, {
            type: 'preview-loaded',
            session: 1,
            outcomes: cleanOutcomes,
            snapshot,
        });
        expect(state.preview).toBeUndefined();
        expect(state.previewSnapshot).toBeUndefined();
        expect(deleteArmed(state)).toBe(false);
    });

    it('ignores a delete result belonging to a closed session', () => {
        let state = flowDeleteDialogReducer(CLOSED_DELETE_DIALOG_STATE, {
            type: 'opened',
            session: 1,
        });
        state = flowDeleteDialogReducer(state, {type: 'run-started', commit: true});
        state = flowDeleteDialogReducer(state, {type: 'closed', session: 2});
        state = flowDeleteDialogReducer(state, {type: 'opened', session: 3});
        state = flowDeleteDialogReducer(state, {
            type: 'delete-finished',
            session: 1,
            outcomes: [{rowId: 'r1', response: {committed: true}}],
            expected: 1,
        });
        expect(state.committed).toBeUndefined();
    });

    it('disarms Delete again while a fresh preview is in flight', () => {
        let state = flowDeleteDialogReducer(openedAndPreviewing(1), {
            type: 'preview-loaded',
            session: 1,
            outcomes: cleanOutcomes,
            snapshot,
        });
        state = flowDeleteDialogReducer(state, {type: 'run-started', commit: false});
        expect(deleteArmed(state)).toBe(false);
    });

    it('reports a partial commit as failed rather than deleted', () => {
        let state = flowDeleteDialogReducer(CLOSED_DELETE_DIALOG_STATE, {
            type: 'opened',
            session: 1,
        });
        state = flowDeleteDialogReducer(state, {type: 'run-started', commit: true});
        const outcomes = [
            {rowId: 'r1', response: {committed: true}},
            {rowId: 'r2', response: {committed: true, errors: ['partition 3 failed']}},
        ];
        state = flowDeleteDialogReducer(state, {
            type: 'delete-finished',
            session: 1,
            outcomes,
            expected: 3,
        });
        expect(state.committed).toBeUndefined();
        expect(state.failed).toEqual(outcomes);
    });

    it('reopens with force cleared so a paused delete must be re-confirmed', () => {
        let state = flowDeleteDialogReducer(CLOSED_DELETE_DIALOG_STATE, {
            type: 'opened',
            session: 1,
        });
        state = flowDeleteDialogReducer(state, {type: 'force-changed', force: true});
        state = flowDeleteDialogReducer(state, {type: 'closed', session: 2});
        state = flowDeleteDialogReducer(state, {type: 'opened', session: 3});
        expect(state.force).toBe(false);
    });
});

describe('normalizeReadStatesResponse', () => {
    it('unwraps annotated scalars and keeps only unsafe integers annotated', () => {
        const annotated = {
            key_states: [
                {
                    computation_id: {$type: 'string', $value: 'c'},
                    key: [
                        {$type: 'uint64', $value: '18446744073709551615'},
                        {$type: 'int64', $value: '42'},
                    ],
                    states: {
                        '/s': {
                            count: {$type: 'uint64', $value: '9007199254740993'},
                            enabled: {$type: 'boolean', $value: 'true'},
                            share: {$type: 'double', $value: '0.5'},
                            note: {$type: 'string', $value: 'text'},
                        },
                    },
                },
            ],
            errors: [{$type: 'string', $value: 'boom'}],
        };
        expect(normalizeReadStatesResponse(annotated)).toEqual({
            key_states: [
                {
                    computation_id: 'c',
                    key: [{$type: 'uint64', $value: '18446744073709551615'}, 42],
                    states: {
                        '/s': {
                            count: {$type: 'uint64', $value: '9007199254740993'},
                            enabled: true,
                            share: 0.5,
                            note: 'text',
                        },
                    },
                },
            ],
            errors: ['boom'],
        });
    });
    it('returns numbers up to the exact safe boundary and wraps just past it', () => {
        expect(normalizeAnnotatedValue({$type: 'uint64', $value: '9007199254740991'})).toBe(
            9007199254740991,
        );
        expect(normalizeAnnotatedValue({$type: 'int64', $value: '-9007199254740991'})).toBe(
            -9007199254740991,
        );
        expect(normalizeAnnotatedValue({$type: 'uint64', $value: '9007199254740992'})).toEqual({
            $type: 'uint64',
            $value: '9007199254740992',
        });
    });
    it('preserves attribute-carrying nodes in the unipika convention', () => {
        expect(
            normalizeAnnotatedValue({
                $attributes: {cluster: {$type: 'string', $value: 'seneca'}},
                $value: {$type: 'string', $value: '//home/t'},
            }),
        ).toEqual({$attributes: {cluster: 'seneca'}, $value: '//home/t'});
    });
    it('keeps attributes attached to an unsafe integer', () => {
        expect(
            normalizeAnnotatedValue({
                $attributes: {a: {$type: 'int64', $value: '1'}},
                $type: 'uint64',
                $value: '18446744073709551615',
            }),
        ).toEqual({
            $attributes: {a: 1},
            $type: 'uint64',
            $value: '18446744073709551615',
        });
    });
    it('passes plain trees through untouched', () => {
        expect(normalizeAnnotatedValue({a: [1, 'x', true, null]})).toEqual({
            a: [1, 'x', true, null],
        });
    });
    it('recurses fields when annotation keys sit alongside unrelated siblings', () => {
        expect(
            normalizeAnnotatedValue({
                $type: 'not-a-real-type',
                otherField: {$type: 'int64', $value: '5'},
            }),
        ).toEqual({
            $type: 'not-a-real-type',
            otherField: 5,
        });
    });
    it('keeps a malformed typed integer annotated instead of throwing, sparing sibling rows', () => {
        const response = {
            key_states: [
                {
                    computation_id: {$type: 'string', $value: 'c'},
                    states: {
                        '/broken': {$type: 'uint64', $value: 'not-a-number'},
                        '/empty': {$type: 'int64', $value: ''},
                        '/overflow': {$type: 'uint64', $value: '99999999999999999999999999'},
                        '/good': {$type: 'int64', $value: '42'},
                    },
                },
            ],
        };
        expect(() => normalizeReadStatesResponse(response)).not.toThrow();
        expect(normalizeReadStatesResponse(response)).toEqual({
            key_states: [
                {
                    computation_id: 'c',
                    states: {
                        '/broken': {$type: 'uint64', $value: 'not-a-number'},
                        '/empty': {$type: 'int64', $value: ''},
                        '/overflow': {$type: 'uint64', $value: '99999999999999999999999999'},
                        '/good': 42,
                    },
                },
            ],
        });
    });
});

describe('big integer display and identity', () => {
    const big = {$type: 'uint64', $value: '18446744073709551615'} as const;
    it('recognizes annotated 64-bit integers and nothing else', () => {
        expect(isAnnotatedBigInteger(big)).toBe(true);
        expect(isAnnotatedBigInteger({$type: 'string', $value: 'x'})).toBe(false);
        expect(isAnnotatedBigInteger({$value: '5'})).toBe(false);
        expect(isAnnotatedBigInteger('18446744073709551615')).toBe(false);
    });
    it('renders an annotated key part as its digits', () => {
        expect(keyValuesFromRowKey([big], [{name: 'k', type: 'uint64'}])).toEqual({
            k: '18446744073709551615',
        });
    });
    it('stringifies annotated integers as digits, bare at the root', () => {
        expect(stringifyStateValue(big)).toBe('18446744073709551615');
        expect(stringifyStateValue({count: big})).toBe('{"count":"18446744073709551615"}');
    });
    it('copies annotated integers as digits', () => {
        expect(serializeRawStateValue(big)).toBe('18446744073709551615');
        expect(serializeRawStateValue([big])).toBe('["18446744073709551615"]');
    });
    it('round-trips an annotated key into the delete body untouched', () => {
        const row: FlowStateResultRow = {
            section: 'external_key_state',
            computationId: 'c',
            key: {k: big},
            stateName: '/s',
            value: 1,
        };
        expect(buildRowDeleteBody(row)).toEqual({
            computation_id: 'c',
            key: {k: big},
            name: '/s',
            target: 'external_key_state',
        });
    });
    it('distinguishes row ids for big keys differing only in low digits', () => {
        const rowA: FlowStateResultRow = {
            section: 'key_state',
            computationId: 'c',
            key: [big],
            stateName: '/s',
            value: 1,
        };
        const rowB: FlowStateResultRow = {
            ...rowA,
            key: [{$type: 'uint64', $value: '18446744073709551614'}],
        };
        expect(getStateRowId(rowA)).not.toBe(getStateRowId(rowB));
    });
});

const overrideColumns = [
    {name: 'bucket', type: 'uint64', expression: 'farm_hash(region)'},
    {name: 'region', type: 'string'},
];

const joinerOverrideSpec: FlowStaticSpec = {
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

const wrappedJoinerOverrideSpec: FlowStaticSpec = {
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

const collisionSpec: FlowStaticSpec = {
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

const computationResolution: FlowKeySchemaResolution = {
    keyColumns: [keyColumns[1]],
    allKeyColumns: keyColumns,
    overrideActive: false,
};

const overrideResolution: FlowKeySchemaResolution = {
    keyColumns: [overrideColumns[1]],
    allKeyColumns: overrideColumns,
    overrideActive: true,
};

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

describe('buildStateReadBody', () => {
    it('narrows a keyed override lookup to the external target the backend accepts', () => {
        expect(
            buildStateReadBody(
                filters({computationId: 'state', stateName: '/joined', keyValues: {region: 'ru'}}),
                overrideResolution,
            ),
        ).toEqual({
            body: {
                computation_id: 'state',
                key: {region: 'ru'},
                name: '/joined',
                target: 'external_key_state',
            },
        });
    });
    it('keeps the narrowed target when the filters already ask for it', () => {
        expect(
            buildStateReadBody(
                filters({
                    computationId: 'state',
                    stateName: '/joined',
                    keyValues: {region: 'ru'},
                    target: 'external_key_state',
                }),
                overrideResolution,
            ),
        ).toEqual({
            body: {
                computation_id: 'state',
                key: {region: 'ru'},
                name: '/joined',
                target: 'external_key_state',
            },
        });
    });
    it('leaves a keyless override read untouched', () => {
        expect(
            buildStateReadBody(
                filters({computationId: 'state', stateName: '/joined'}),
                overrideResolution,
            ),
        ).toEqual({body: {computation_id: 'state', name: '/joined'}});
    });
    it('leaves non-override bodies byte-identical to buildStateAccessBody', () => {
        const plainFilters = filters({
            computationId: 'state',
            keyValues: {key: '7'},
            stateName: '/state',
        });
        expect(buildStateReadBody(plainFilters, computationResolution)).toEqual({
            body: {
                computation_id: 'state',
                key: {key: {$type: 'uint64', $value: '7'}},
                name: '/state',
            },
        });
        expect(buildStateReadBody(plainFilters, computationResolution)).toEqual(
            buildStateAccessBody(plainFilters, computationResolution.keyColumns),
        );
    });
    it('passes validation errors through', () => {
        expect(buildStateReadBody(filters({}), overrideResolution)).toEqual({
            error: {errorKey: 'validation_no-scope'},
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

describe('buildRowFilterUpdate joined override rows', () => {
    const joinedRow: FlowStateResultRow = {
        section: 'joined_external_key_state',
        computationId: 'state',
        key: [42, 'ru'],
        stateName: '/joined',
        value: 1,
    };
    it('pins the joiner name and the all target when applying an override row key', () => {
        const next = buildRowFilterUpdate(
            filters({computationId: 'state', stateName: '/state', target: 'external_key_state'}),
            joinedRow,
            'key',
            {
                ...resolveRowKeySchema(joinerOverrideSpec, joinedRow),
                stateNames: ['/state', '/joined'],
                fixedComputationId: undefined,
            },
        );
        expect(next).toEqual(
            filters({
                computationId: 'state',
                keyValues: {region: 'ru'},
                stateName: '/joined',
                target: 'all',
            }),
        );
    });
    it('keeps the current name and target for a joined row without an override', () => {
        const row = {...joinedRow, stateName: '/plain', key: [42, 7]};
        const next = buildRowFilterUpdate(
            filters({computationId: 'state', stateName: '/plain'}),
            row,
            'key',
            {
                ...resolveRowKeySchema(joinerOverrideSpec, row),
                stateNames: ['/state', '/joined'],
                fixedComputationId: undefined,
            },
        );
        expect(next).toEqual(
            filters({computationId: 'state', keyValues: {key: '7'}, stateName: '/plain'}),
        );
    });
    it('refuses the key click on a joined override row that collides with a manager', () => {
        const row = {...joinedRow, stateName: '/both'};
        expect(
            buildRowFilterUpdate(filters({computationId: 'state'}), row, 'key', {
                ...resolveRowKeySchema(collisionSpec, row),
                stateNames: ['/both'],
                fixedComputationId: undefined,
            }),
        ).toBeUndefined();
    });
});

const heavyHittersMessage = {
    level: 'info' as const,
    text: 'Top 2 heavy hitters',
    yson: [
        'Key=[0#7147230554789414993u, 1#"17853020244229040161506001"], Ratio=0.306083, PartitionId=451c1f9-678607be-3b545a99-97dc719a',
        'Key=[0#16309018135344887709u, 1#"17853033360341882129806001"], Ratio=0.181031, PartitionId=9ea1d52c-18873875-d7452d51-f068ca47',
    ],
};

describe('splitHeavyHittersMessages', () => {
    it('parses the heavy hitters message and removes it from the remaining messages', () => {
        const other = {level: 'warning' as const, text: 'something else'};
        expect(splitHeavyHittersMessages([other, heavyHittersMessage])).toEqual({
            heavyHitters: {
                title: 'Top 2 heavy hitters',
                entries: [
                    {
                        keyText: '[0#7147230554789414993u, 1#"17853020244229040161506001"]',
                        ratio: 0.306083,
                        partitionId: '451c1f9-678607be-3b545a99-97dc719a',
                    },
                    {
                        keyText: '[0#16309018135344887709u, 1#"17853033360341882129806001"]',
                        ratio: 0.181031,
                        partitionId: '9ea1d52c-18873875-d7452d51-f068ca47',
                    },
                ],
                unparsedEntries: [],
            },
            otherMessages: [other],
        });
    });
    it('keeps every message when no heavy hitters message is present', () => {
        const other = {level: 'info' as const, text: 'Top of the morning', yson: []};
        expect(splitHeavyHittersMessages([other])).toEqual({otherMessages: [other]});
        expect(splitHeavyHittersMessages(undefined)).toEqual({otherMessages: []});
    });
    it('collects unparsable lines separately', () => {
        expect(
            splitHeavyHittersMessages([
                {level: 'info', text: 'Top 1 heavy hitters', yson: ['Key=[0#1u], Ratio=x, Part=y']},
            ]),
        ).toEqual({
            heavyHitters: {
                title: 'Top 1 heavy hitters',
                entries: [],
                unparsedEntries: ['Key=[0#1u], Ratio=x, Part=y'],
            },
            otherMessages: [],
        });
    });
});

describe('parseHeavyHitterKeyText', () => {
    it('parses column-id prefixed values produced by the flow controller', () => {
        expect(
            parseHeavyHitterKeyText('[0#7147230554789414993u, 1#"17853020244229040161506001"]'),
        ).toEqual(['7147230554789414993', '17853020244229040161506001']);
    });
    it('parses a bare single value, booleans and negative integers', () => {
        expect(parseHeavyHitterKeyText('[7u]')).toEqual(['7']);
        expect(parseHeavyHitterKeyText('[0#%true, 1#-12]')).toEqual(['true', '-12']);
    });
    it('keeps a comma inside a quoted value', () => {
        expect(parseHeavyHitterKeyText('[0#"a,b", 1#2]')).toEqual(['a,b', '2']);
    });
    it('rejects out-of-order column ids, escapes, unbalanced quotes and non-list text', () => {
        expect(parseHeavyHitterKeyText('[1#1u, 0#2u]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[0#"a\\"b"]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[0#"ab]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('0#1u')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[]')).toBeUndefined();
        expect(parseHeavyHitterKeyText('[0#{a=1}]')).toBeUndefined();
    });
});

describe('buildHeavyHitterStateLink', () => {
    it('builds a computation state-tab link carrying the pipeline path and the seed', () => {
        expect(
            buildHeavyHitterStateLink('hahn', '//pipeline', 'state', {keyValues: {key: '7'}}),
        ).toBe(
            '/hahn/flows/computations/state/state?path=%2F%2Fpipeline&heavyHitterSeed=%7B%22keyValues%22%3A%7B%22key%22%3A%227%22%7D%7D',
        );
    });
    it('percent-encodes a computation id containing special characters', () => {
        expect(
            buildHeavyHitterStateLink('hahn', '//pipeline', 'a/b', {partitionId: 'p'}),
        ).toContain('/computations/a%2Fb/state');
    });
});

describe('parseHeavyHitterStateSeed', () => {
    it('round-trips keyValues and partitionId through the built link', () => {
        const seed = {keyValues: {key: '7'}, partitionId: 'p1'};
        const url = buildHeavyHitterStateLink('hahn', '//pipeline', 'state', seed);
        const params = new URLSearchParams(url.split('?')[1]);
        expect(params.get('path')).toBe('//pipeline');
        expect(parseHeavyHitterStateSeed(params.get('heavyHitterSeed'))).toEqual(seed);
    });
    it('returns undefined for missing, malformed or empty input', () => {
        expect(parseHeavyHitterStateSeed(null)).toBeUndefined();
        expect(parseHeavyHitterStateSeed('not json')).toBeUndefined();
        expect(parseHeavyHitterStateSeed('null')).toBeUndefined();
        expect(parseHeavyHitterStateSeed('{}')).toBeUndefined();
        expect(parseHeavyHitterStateSeed('[]')).toBeUndefined();
    });
    it('drops non-string keyValues entries and a non-string partitionId', () => {
        expect(
            parseHeavyHitterStateSeed(JSON.stringify({partitionId: 5, keyValues: {a: '1', b: 2}})),
        ).toEqual({keyValues: {a: '1'}});
    });
});
