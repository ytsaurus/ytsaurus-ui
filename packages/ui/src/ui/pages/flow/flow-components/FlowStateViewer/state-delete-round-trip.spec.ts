import {buildRowDeleteBody} from './state-delete';
import {flattenReadStatesResponse, getStateRowId} from './state-requests';
import {normalizeReadStatesResponse} from '../../../../store/api/yt/flow/read-states-normalize';
import type {FlowStateResultRow} from './types';

describe('typed read-to-delete round trip', () => {
    const big = {$type: 'uint64', $value: '18446744073709551615'} as const;
    it('keeps uint64 and Unicode keys typed through read, delete and serialization', () => {
        const response = normalizeReadStatesResponse({
            key_states: [
                {
                    computation_id: {$type: 'string', $value: 'c'},
                    key: [big, {$type: 'string', $value: 'ключ'}],
                    states: {'/s': {$type: 'int64', $value: '1'}},
                },
            ],
        });
        const [row] = flattenReadStatesResponse(response);
        const body = buildRowDeleteBody(row);

        expect(JSON.parse(JSON.stringify(body)).key).toEqual([big, 'ключ']);
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
