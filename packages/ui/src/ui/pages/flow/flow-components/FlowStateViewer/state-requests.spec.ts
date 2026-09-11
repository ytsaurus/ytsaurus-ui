import {
    buildStateAccessBody,
    buildStateReadBody,
    flattenReadStatesResponse,
    getStateRowId,
} from './state-requests';
import {
    computationResolution,
    filters,
    keyColumns,
    overrideResolution,
} from './state-test-fixtures';

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
    it('maps a runtime key without a declared schema', () => {
        const rawKey = ['queue', '42fde9d2bebc2af3edd7556f8c113c02', 0];
        expect(buildStateAccessBody(filters({computationId: 'reader', rawKey}), [])).toEqual({
            body: {computation_id: 'reader', key: rawKey},
        });
    });
    it('preserves a __proto__ key column as an own literal property', () => {
        const built = buildStateAccessBody(
            filters({
                computationId: 'state',
                keyValues: Object.fromEntries([['__proto__', 'literal']]),
            }),
            [{name: '__proto__', type: 'string'}],
        );

        expect(
            Object.prototype.hasOwnProperty.call('body' in built && built.body.key, '__proto__'),
        ).toBe(true);
        expect(JSON.stringify('body' in built && built.body.key)).toBe('{"__proto__":"literal"}');
    });
    it('treats missing special-name request values as absent own properties', () => {
        expect(() =>
            buildStateAccessBody(filters({computationId: 'state'}), [
                {name: 'toString', type: 'string'},
                {name: '__proto__', type: 'string'},
            ]),
        ).not.toThrow();
        expect(
            buildStateAccessBody(filters({computationId: 'state'}), [
                {name: 'toString', type: 'string'},
                {name: '__proto__', type: 'string'},
            ]),
        ).toEqual({body: {computation_id: 'state'}});
    });
    it('ignores inherited request key values', () => {
        expect(
            buildStateAccessBody(
                filters({
                    computationId: 'state',
                    keyValues: Object.create({key: '7'}) as Record<string, string>,
                }),
                [keyColumns[1]],
            ),
        ).toEqual({body: {computation_id: 'state'}});
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
