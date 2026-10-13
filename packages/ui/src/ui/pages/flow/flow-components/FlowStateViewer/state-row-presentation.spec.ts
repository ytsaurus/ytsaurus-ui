import {parseRawKeyDraft} from './state-key';
import {resolveRowKeySchema} from './state-schema';
import {buildStateReadBody} from './state-requests';
import {
    buildRowFilterUpdate,
    buildRowKeyPresentation,
    keyValuesFromRowKey,
} from './state-row-presentation';
import type {FlowStateResultRow} from './types';
import {collisionSpec, filters, joinerOverrideSpec} from './state-test-fixtures';

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
    it('rejects inherited object-key fields', () => {
        expect(
            keyValuesFromRowKey(Object.create({user: 7, flag: true}), columns, allColumns),
        ).toBeUndefined();
    });
    it('maps own special-name object-key fields', () => {
        const specialColumns = [
            {name: 'toString', type: 'string'},
            {name: '__proto__', type: 'string'},
        ];
        const key = Object.fromEntries([
            ['toString', 'method'],
            ['__proto__', 'prototype'],
        ]);
        expect(keyValuesFromRowKey(key, specialColumns)).toEqual(
            Object.fromEntries([
                ['toString', 'method'],
                ['__proto__', 'prototype'],
            ]),
        );
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
    it('keeps an already-active target filter clickable with an idempotent update', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1', target: 'key_state'}),
                row,
                'target',
                context,
            ),
        ).toEqual(filters({computationId: 'c1', target: 'key_state'}));
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
    it('keeps an already-active computation filter clickable with an idempotent update', () => {
        expect(
            buildRowFilterUpdate(filters({computationId: 'c2'}), row, 'computation', context),
        ).toEqual(filters({computationId: 'c2'}));
    });
    it('applies and preserves the row partition filter', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c2'}),
                {...row, partitionId: 'p1'},
                'partition',
                context,
            ),
        ).toEqual(filters({computationId: 'c2', partitionId: 'p1'}));
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c2', partitionId: 'p1'}),
                {...row, partitionId: 'p1'},
                'partition',
                context,
            ),
        ).toEqual(filters({computationId: 'c2', partitionId: 'p1'}));
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
    it('keeps an already-active state filter clickable with an idempotent update', () => {
        expect(
            buildRowFilterUpdate(
                filters({computationId: 'c1', stateName: '/s'}),
                row,
                'stateName',
                context,
            ),
        ).toEqual(filters({computationId: 'c1', stateName: '/s'}));
    });
});

describe('buildRowKeyPresentation', () => {
    it('uses normalized string key values for display, copy and filtering', () => {
        const filterKeyColumns = [{name: 'title', type: 'string'}];
        const presentation = buildRowKeyPresentation(
            filters({computationId: 'state'}),
            {
                section: 'key_state',
                computationId: 'state',
                key: ['Веник'],
                stateName: '/counter',
                value: 1,
            },
            {keyColumns: filterKeyColumns, allKeyColumns: filterKeyColumns},
        );

        expect(presentation).toMatchObject({
            rawKey: '["Веник"]',
            filterUpdate: filters({
                computationId: 'state',
                keyValues: {title: 'Веник'},
            }),
        });
        const pasted = parseRawKeyDraft(presentation?.rawKey ?? '', filterKeyColumns);
        expect(pasted).toEqual({values: {title: 'Веник'}});
        expect(
            buildStateReadBody(
                {
                    ...(presentation?.filterUpdate ?? filters({})),
                    keyValues: ('values' in pasted ? pasted.values : undefined) ?? {},
                },
                {
                    keyColumns: filterKeyColumns,
                    allKeyColumns: filterKeyColumns,
                    overrideActive: false,
                },
            ),
        ).toEqual({body: {computation_id: 'state', key: {title: 'Веник'}}});
    });

    it('uses the same filterable key values for click and copy while omitting expressions', () => {
        const filterKeyColumns = [
            {name: 'user', type: 'uint64'},
            {name: 'active', type: 'boolean'},
        ];
        const allKeyColumns = [
            {name: 'hash', type: 'uint64', expression: 'farm_hash(user)'},
            ...filterKeyColumns,
        ];
        const presentation = buildRowKeyPresentation(
            filters({computationId: 'state'}),
            {
                section: 'key_state',
                computationId: 'state',
                key: [{$type: 'uint64', $value: '999'}, {$type: 'uint64', $value: '7'}, true],
                stateName: '/counter',
                value: 1,
            },
            {keyColumns: filterKeyColumns, allKeyColumns},
        );

        expect(presentation).toEqual({
            rawKey: '[7u;%true]',
            filterUpdate: filters({
                computationId: 'state',
                keyValues: {user: '7', active: 'true'},
            }),
        });
        expect(parseRawKeyDraft(presentation?.rawKey ?? '', filterKeyColumns)).toEqual({
            values: presentation?.filterUpdate.keyValues,
        });
    });

    it('does not present an empty string key as filterable', () => {
        const filterKeyColumns = [{name: 'user', type: 'string'}];
        const presentation = buildRowKeyPresentation(
            filters({computationId: 'state'}),
            {
                section: 'key_state',
                computationId: 'state',
                key: [''],
                stateName: '/counter',
                value: 1,
            },
            {keyColumns: filterKeyColumns, allKeyColumns: filterKeyColumns},
        );

        expect(presentation).toBeUndefined();
    });

    it('uses the complete runtime key when the computation declares no key schema', () => {
        const presentation = buildRowKeyPresentation(
            filters({computationId: 'reader'}),
            {
                section: 'key_state',
                computationId: 'reader',
                key: ['queue', '42fde9d2bebc2af3edd7556f8c113c02', 0],
                stateName: '/$watermark/v0',
                value: 1,
            },
            {keyColumns: [], allKeyColumns: []},
        );

        expect(presentation).toEqual({
            rawKey: '["queue","42fde9d2bebc2af3edd7556f8c113c02",0]',
            filterUpdate: filters({
                computationId: 'reader',
                rawKey: ['queue', '42fde9d2bebc2af3edd7556f8c113c02', 0],
            }),
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
