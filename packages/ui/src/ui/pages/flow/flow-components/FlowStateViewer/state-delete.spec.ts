import {
    aggregateMatchedTotal,
    areAllCommitted,
    buildRowDeleteBody,
    countCommitted,
    deleteStatesGate,
    getRowsPendingDelete,
    isWriteDeniedByPermission,
    mergeDeleteOutcomes,
    runDeleteAttempt,
    runRowDeletes,
} from './state-delete';
import {getStateRowId, selectDeletableRows} from './state-requests';
import type {FlowStateResultRow} from './types';
import type {FlowDeleteStatesBody, FlowDeleteStatesResponse} from '../../../../../shared/yt-types';

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
    it('ignores inherited selection flags', () => {
        const selection = Object.create({[getStateRowId(keyRow)]: true}) as Record<string, boolean>;
        expect(selectDeletableRows([keyRow], selection)).toEqual([]);
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
            {force: false},
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
        });
        expect(outcomes).toHaveLength(1);
        expect(execute).toHaveBeenCalledTimes(1);
    });
    it('stops at a rejected call and records the error', async () => {
        const execute = jest.fn().mockRejectedValue(new Error('denied'));
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: true,
        });
        expect(outcomes).toHaveLength(1);
        expect(outcomes[0].error).toBeInstanceOf(Error);
    });
    it('stops when cancelled', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        const outcomes = await runRowDeletes([keyRow, partitionRow], execute, {
            force: false,
            isCancelled: () => true,
        });
        expect(outcomes).toEqual([]);
        expect(execute).not.toHaveBeenCalled();
    });
    it('drops an outcome when cancellation happens during the request', async () => {
        let resolveDelete: ((value: FlowDeleteStatesResponse) => void) | undefined;
        let cancelled = false;
        const execute = jest.fn(
            () =>
                new Promise<FlowDeleteStatesResponse>((resolve) => {
                    resolveDelete = resolve;
                }),
        );
        const pending = runRowDeletes([keyRow], execute, {
            force: false,
            isCancelled: () => cancelled,
        });

        cancelled = true;
        resolveDelete?.({committed: true});

        expect(await pending).toEqual([]);
    });
});

describe('runDeleteAttempt', () => {
    const row: FlowStateResultRow = {
        section: 'key_state',
        computationId: 'c',
        key: [7],
        stateName: '/s',
        value: 1,
    };

    function attempt(overrides: Partial<Parameters<typeof runDeleteAttempt>[0]> = {}) {
        return runDeleteAttempt({
            session: 1,
            rows: [row],
            force: false,
            refreshPermission: async () => ({action: 'allow'}),
            refreshPipelineState: async () => 'Stopped',
            execute: async () => ({committed: true}),
            isSessionCurrent: () => true,
            ...overrides,
        });
    }

    it('blocks before mutation when fresh permission is revoked', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        expect(await attempt({refreshPermission: async () => ({action: 'deny'}), execute})).toEqual(
            {session: 1, status: 'blocked'},
        );
        expect(execute).not.toHaveBeenCalled();
    });

    it('blocks before mutation when the fresh pipeline state is unsafe', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        expect(await attempt({refreshPipelineState: async () => 'Working', execute})).toEqual({
            session: 1,
            status: 'blocked',
        });
        expect(execute).not.toHaveBeenCalled();
    });

    it('requires force for a freshly paused pipeline and forwards it to the mutation', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        expect(await attempt({refreshPipelineState: async () => 'Paused', execute})).toEqual({
            session: 1,
            status: 'blocked',
        });
        expect(execute).not.toHaveBeenCalled();

        expect(
            await attempt({force: true, refreshPipelineState: async () => 'Paused', execute}),
        ).toEqual({
            session: 1,
            status: 'completed',
            outcomes: [expect.objectContaining({response: {committed: true}})],
        });
        expect(execute).toHaveBeenCalledWith(expect.objectContaining({force: true, commit: true}));
    });

    it('fails closed when either fresh gate request rejects', async () => {
        const execute = jest.fn(async () => ({committed: true}));
        expect(
            await attempt({
                refreshPermission: async () => {
                    throw new Error('unavailable');
                },
                execute,
            }),
        ).toEqual({session: 1, status: 'blocked'});
        expect(execute).not.toHaveBeenCalled();
    });

    it('returns stale and drops the in-flight outcome when its session is invalidated', async () => {
        let resolveDelete: ((value: FlowDeleteStatesResponse) => void) | undefined;
        let current = true;
        const pending = attempt({
            execute: () =>
                new Promise<FlowDeleteStatesResponse>((resolve) => {
                    resolveDelete = resolve;
                }),
            isSessionCurrent: () => current,
        });

        await Promise.resolve();
        await Promise.resolve();
        current = false;
        resolveDelete?.({committed: true});

        expect(await pending).toEqual({session: 1, status: 'stale'});
    });
});

describe('partial failure retry lifecycle', () => {
    const first: FlowStateResultRow = {
        section: 'key_state',
        computationId: 'c',
        key: [1],
        stateName: '/s',
        value: 1,
    };
    const second: FlowStateResultRow = {...first, key: [2]};
    const firstId = getStateRowId(first);
    const secondId = getStateRowId(second);

    it('retries only unresolved rows and retains cumulative committed outcomes', () => {
        const firstAttempt = [
            {rowId: firstId, response: {committed: true}},
            {rowId: secondId, response: {committed: false, errors: ['locked']}},
        ];
        expect(getRowsPendingDelete([first, second], firstAttempt)).toEqual([second]);

        const merged = mergeDeleteOutcomes([first, second], firstAttempt, [
            {rowId: secondId, response: {committed: true}},
        ]);
        expect(merged).toEqual([
            {rowId: firstId, response: {committed: true}},
            {rowId: secondId, response: {committed: true}},
        ]);
        expect(areAllCommitted(merged, 2)).toBe(true);
    });

    it('replaces only the retried failure and preserves prior successes', () => {
        const firstAttempt = [
            {rowId: firstId, response: {committed: true}},
            {rowId: secondId, response: {committed: false, errors: ['locked']}},
        ];
        expect(
            mergeDeleteOutcomes([first, second], firstAttempt, [
                {rowId: secondId, response: {committed: false, errors: ['still locked']}},
            ]),
        ).toEqual([
            {rowId: firstId, response: {committed: true}},
            {rowId: secondId, response: {committed: false, errors: ['still locked']}},
        ]);
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
    it('keeps a cached allow during background refresh but denies missing or errored data', () => {
        expect(isWriteDeniedByPermission({data: {action: 'allow'}, isFetching: true})).toBe(false);
        expect(isWriteDeniedByPermission({isFetching: true})).toBe(true);
        expect(
            isWriteDeniedByPermission({data: {action: 'allow'}, error: new Error('stale')}),
        ).toBe(true);
    });
});
