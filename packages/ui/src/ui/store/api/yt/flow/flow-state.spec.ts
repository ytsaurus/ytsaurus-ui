import {configureStore} from '@reduxjs/toolkit';

import {TYPED_INPUT_FORMAT, TYPED_OUTPUT_FORMAT} from '../../../../constants';

jest.mock('../../../../rum/rum-wrap-api', () => ({
    YTApiId: {flowExecute: 'flowExecute'},
    ytApiV4: {},
    ytApiV4Id: {flowExecute: jest.fn().mockResolvedValue({})},
}));
jest.mock('../../../../store/redux-hooks', () => ({useSelector: jest.fn()}));
jest.mock('../../../../store/selectors/global/cluster', () => ({selectCluster: jest.fn()}));
jest.mock('../use-current-cluster', () => ({
    useCurrentClusterArgs: (args: unknown) => args,
}));

import {ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {rootApi} from '../../index';
import {flowApi} from './index';

const mockFlowExecute = ytApiV4Id.flowExecute as unknown as jest.Mock;

function makeStore() {
    return configureStore({
        reducer: {[rootApi.reducerPath]: rootApi.reducer},
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rootApi.middleware),
    });
}

beforeEach(() => {
    mockFlowExecute.mockReset();
    mockFlowExecute.mockResolvedValue({});
});

describe('flowReadStates endpoint', () => {
    it('sends typed formats and normalizes the annotated response', async () => {
        mockFlowExecute.mockResolvedValue({
            key_states: [
                {
                    computation_id: {$type: 'string', $value: 'c1'},
                    key: [{$type: 'uint64', $value: '5'}],
                    states: {'/s': {$type: 'int64', $value: '7'}},
                },
            ],
        });
        const result = await makeStore().dispatch(
            flowApi.endpoints.flowReadStates.initiate({
                parameters: {pipeline_path: '//pipeline'},
                body: {computation_id: 'c1', limit: 10},
            }),
        );

        const [id, args] = mockFlowExecute.mock.calls[0];
        expect(id).toBe('flowExecute_read-states');
        expect(args.parameters.input_format).toBe(TYPED_INPUT_FORMAT);
        expect(args.parameters.output_format).toBe(TYPED_OUTPUT_FORMAT);
        expect(args.data).toEqual({computation_id: 'c1', limit: 10});
        expect(result.data).toEqual({
            key_states: [{computation_id: 'c1', key: [5], states: {'/s': 7}}],
        });
    });
});

describe('flowDeleteStates endpoint', () => {
    it('sends the typed input format with the delete body', async () => {
        await makeStore().dispatch(
            flowApi.endpoints.flowDeleteStates.initiate({
                parameters: {pipeline_path: '//pipeline'},
                body: {computation_id: 'c1', commit: true, force: false},
            }),
        );

        const [id, args] = mockFlowExecute.mock.calls[0];
        expect(id).toBe('flowExecute_delete-states');
        expect(args.parameters.input_format).toBe(TYPED_INPUT_FORMAT);
        expect(args.parameters.output_format).toBeUndefined();
        expect(args.data).toEqual({computation_id: 'c1', commit: true, force: false});
    });
});
