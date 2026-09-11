import {
    castKeyValue,
    formatRawKeyDraft,
    getAvailableStateTargets,
    getComputationGroupByColumns,
    getComputationKeyColumns,
    getComputationStateNames,
    getStateNameInputMode,
    getStateNameSelectItems,
    parseRawKeyDraft,
    reconcileStateName,
    reconcileStateTarget,
    resolveKeySchema,
    resolveRowKeySchema,
    seedStateFilters,
} from './state-filters';
import {buildStateAccessBody} from './state-requests';
import type {FlowStateResultRow} from './types';
import type {FlowKeyColumn, FlowStaticSpec} from '../../../../../shared/yt-types';
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

describe('raw key drafts', () => {
    const stringColumns: Array<FlowKeyColumn> = [
        {name: 'first', type: 'string'},
        {name: 'second', type: 'string'},
        {name: 'third', type: 'string'},
    ];

    it('accepts valid unquoted YSON string tokens without identifier restrictions', () => {
        expect(
            parseRawKeyDraft('[Веник с проволокой; 42/market@key; true]', stringColumns),
        ).toEqual({
            values: {first: 'Веник с проволокой', second: '42/market@key', third: 'true'},
        });
    });

    it('round-trips quoted and escaped UTF-8 key values', () => {
        const values = {
            first: 'Веник-И-"пленка"',
            second: 'строка;с-разделителем',
            third: 'обычная строка',
        };
        const raw = formatRawKeyDraft(stringColumns, values);

        expect(parseRawKeyDraft(raw, stringColumns)).toEqual({values});
    });

    it('accepts empty input and rejects partially empty keys', () => {
        expect(parseRawKeyDraft('', stringColumns)).toEqual({
            values: {first: '', second: '', third: ''},
        });
        expect(parseRawKeyDraft('[first; ; third]', stringColumns)).toEqual({
            error: {errorKey: 'validation_fill-all-keys'},
        });
    });

    it.each(['first; second; third', '[first; [second]; third]', '[first; {second}; third]'])(
        'rejects malformed or nested input %s',
        (raw) => {
            expect(parseRawKeyDraft(raw, stringColumns)).toEqual({
                error: {errorKey: 'validation_invalid-key-syntax'},
            });
        },
    );

    it('rejects the wrong arity', () => {
        expect(parseRawKeyDraft('[first; second]', stringColumns)).toEqual({
            error: {errorKey: 'validation_key-arity', params: {expected: '3'}},
        });
    });

    it.each([
        ['[42]', {name: 'key', type: 'int64'}, '42'],
        ['[42u]', {name: 'key', type: 'uint64'}, '42'],
        ['[1.5e2]', {name: 'key', type: 'double'}, '1.5e2'],
        ['[%true]', {name: 'key', type: 'boolean'}, 'true'],
    ] as const)('parses canonical token %s', (raw, column, value) => {
        expect(parseRawKeyDraft(raw, [column])).toEqual({values: {key: value}});
    });

    it.each([
        ['["42"]', 'int64'],
        ['[42]', 'uint64'],
        ['[true]', 'boolean'],
        ['[Infinity]', 'double'],
    ])('rejects noncanonical token %s for %s', (raw, type) => {
        expect(parseRawKeyDraft(raw, [{name: 'key', type}])).toEqual({
            error: {errorKey: 'validation_invalid-key-syntax'},
        });
    });

    it('treats a quoted empty string as present and validates it', () => {
        expect(parseRawKeyDraft('[""]', [{name: 'key', type: 'string'}])).toEqual({
            error: {errorKey: 'validation_empty-key-value', params: {name: 'key'}},
        });
    });
});

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
