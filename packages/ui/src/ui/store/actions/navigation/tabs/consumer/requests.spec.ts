import axios from 'axios';

import {type RootState} from '../../../../reducers';
import {ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {
    CONSUMER_PARTITIONS_LOAD_FAILURE,
    CONSUMER_PARTITIONS_LOAD_SUCCESS,
    CONSUMER_STATUS_LOAD_FAILURE,
    CONSUMER_STATUS_LOAD_SUCCESS,
} from '../../../../../constants/navigation/tabs/consumer';
import {loadConsumerPartitions} from './partitions';
import {loadConsumerStatus} from './status';

jest.mock('../../../../../rum/rum-wrap-api', () => ({
    YTApiId: {queueConsumerPartitions: 'partitions', queueConsumerStatus: 'status'},
    ytApiV3Id: {get: jest.fn()},
}));
jest.mock('../../../../../store/selectors/navigation', () => ({
    selectPath: (state: RootState) => state.navigation.navigation.path,
    selectTransaction: (state: RootState) => state.navigation.navigation.transaction,
}));
jest.mock('../../../../../store/selectors/global', () => ({selectCluster: () => 'markov'}));
jest.mock('../../../../../utils/navigation', () => ({prepareRequest: jest.fn()}));

const queue = 'markov://queue';

function createState() {
    return {
        navigation: {
            navigation: {path: '//consumer'},
            tabs: {
                consumer: {
                    filters: {},
                    status: {consumerData: {registrations: [{queue, vital: false}]}},
                },
            },
        },
    } as unknown as RootState;
}

function mockPendingRequest() {
    const source = axios.CancelToken.source();
    let resolve!: (data: unknown) => void;
    let reject!: (error: unknown) => void;
    // Keep completion under test control, including a response already delivered by the transport.
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    jest.mocked(ytApiV3Id.get).mockImplementationOnce((...args) => {
        const cancellation = args[2];
        if (typeof cancellation === 'function') cancellation(source);
        return promise;
    });
    return {source, resolve, reject};
}

describe.each([
    {
        name: 'status',
        load: () => loadConsumerStatus(),
        success: CONSUMER_STATUS_LOAD_SUCCESS,
        failure: CONSUMER_STATUS_LOAD_FAILURE,
        data: {registrations: [{queue, vital: false}]},
    },
    {
        name: 'partitions',
        load: () => loadConsumerPartitions(queue),
        success: CONSUMER_PARTITIONS_LOAD_SUCCESS,
        failure: CONSUMER_PARTITIONS_LOAD_FAILURE,
        data: [{next_row_index: 42}],
    },
])('consumer $name requests', ({load, success, failure, data}) => {
    beforeEach(() => jest.clearAllMocks());

    it('cancels the previous request and ignores its already delivered response', async () => {
        const state = createState();
        const dispatch = jest.fn();
        const previous = mockPendingRequest();
        const previousResult = load()(dispatch, () => state, undefined);
        previous.resolve(data);
        const current = mockPendingRequest();
        const currentResult = load()(dispatch, () => state, undefined);

        expect(axios.isCancel(previous.source.token.reason)).toBe(true);
        await previousResult;
        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({type: success}));

        current.resolve(data);
        await currentResult;
        expect(dispatch).toHaveBeenLastCalledWith({type: success, data});
    });

    it('does not report cancellation as a load failure', async () => {
        const state = createState();
        const dispatch = jest.fn();
        const pending = mockPendingRequest();
        const result = load()(dispatch, () => state, undefined);
        pending.source.cancel();
        pending.reject(pending.source.token.reason);
        await result;

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it.each(['path', 'transaction'] as const)(
        'ignores a response after the navigation %s changes without another request',
        async (field) => {
            const state = createState();
            const dispatch = jest.fn();
            const pending = mockPendingRequest();
            const result = load()(dispatch, () => state, undefined);
            state.navigation.navigation[field] = 'changed';
            pending.resolve(data);
            await result;

            expect(dispatch).toHaveBeenCalledTimes(1);
        },
    );

    it('reports a current request failure', async () => {
        const state = createState();
        const dispatch = jest.fn();
        const pending = mockPendingRequest();
        const result = load()(dispatch, () => state, undefined);
        const error = new Error('Request failed');
        pending.reject(error);
        await result;

        expect(dispatch).toHaveBeenLastCalledWith({type: failure, data: error});
    });
});

it.each(['consumer', 'queue'])(
    'ignores partitions after the selected %s changes',
    async (field) => {
        const state = createState();
        const dispatch = jest.fn();
        const pending = mockPendingRequest();
        const result = loadConsumerPartitions(queue)(dispatch, () => state, undefined);
        state.navigation.tabs.consumer.status.consumerData =
            field === 'consumer'
                ? {
                      queue_consumer_names: ['other'],
                      consumers: {other: {registrations: [{queue, vital: false}]}},
                  }
                : {registrations: [{queue: 'markov://other', vital: false}]};
        pending.resolve([{next_row_index: 42}]);
        await result;

        expect(dispatch).toHaveBeenCalledTimes(1);
    },
);
