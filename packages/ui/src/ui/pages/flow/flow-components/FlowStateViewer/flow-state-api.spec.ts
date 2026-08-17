import {TYPED_INPUT_FORMAT, TYPED_OUTPUT_FORMAT} from '../../../../constants';

import {buildStateAccessBody} from './helpers';
import type {FlowKeyColumn} from './types';

jest.mock('../../../../rum/rum-wrap-api', () => ({
    YTApiId: {flowExecute: 'flowExecute'},
    ytApiV4: {},
    ytApiV4Id: {flowExecute: jest.fn().mockResolvedValue({})},
}));

import {ytApiV4Id} from '../../../../rum/rum-wrap-api';

import {flowDeleteStates, flowReadStates} from './flow-state-api';

const mockFlowExecute = ytApiV4Id.flowExecute as unknown as jest.Mock;

const uint64Key: FlowKeyColumn = {name: 'key', type: 'uint64'};

function bigIntegerKeyBody() {
    const aboveSafeInteger = (BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)).toString();
    const built = buildStateAccessBody(
        {computationId: 'c1', keyValues: {key: aboveSafeInteger}, target: 'key_state', limit: 10},
        [uint64Key],
    );
    if ('error' in built) {
        throw new Error('expected a valid body');
    }
    return {body: built.body, aboveSafeInteger};
}

beforeEach(() => {
    mockFlowExecute.mockClear();
});

describe('flowReadStates', () => {
    it('annotates the request body as typed input alongside the typed output', async () => {
        const {body, aboveSafeInteger} = bigIntegerKeyBody();
        expect(body.key).toEqual({key: {$type: 'uint64', $value: aboveSafeInteger}});

        await flowReadStates('//pipeline', body);

        const [, args] = mockFlowExecute.mock.calls[0];
        expect(args.parameters.input_format).toBe(TYPED_INPUT_FORMAT);
        expect(args.parameters.output_format).toBe(TYPED_OUTPUT_FORMAT);
        expect(args.data).toBe(body);
    });
});

describe('flowDeleteStates', () => {
    it('annotates the request body as typed input', async () => {
        const {body} = bigIntegerKeyBody();

        await flowDeleteStates('//pipeline', body);

        const [, args] = mockFlowExecute.mock.calls[0];
        expect(args.parameters.input_format).toBe(TYPED_INPUT_FORMAT);
        expect(args.data).toBe(body);
    });
});
