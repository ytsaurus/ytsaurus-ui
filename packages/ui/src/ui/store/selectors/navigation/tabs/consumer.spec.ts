import {type RootState} from '../../../reducers';
import {type ConsumerStatusData} from '../../../reducers/navigation/tabs/consumer/status';
import {
    selectConsumerError,
    selectConsumerName,
    selectConsumerPartitionsRequestKey,
    selectConsumerRegisteredQueues,
    selectIsMultiConsumer,
    selectPartitions,
    selectQueueAgentHost,
    selectTargetQueue,
} from './consumer';

jest.mock('..', () => ({
    selectPath: () => '//consumer',
    selectTransaction: () => undefined,
}));
jest.mock('../../global', () => ({selectCluster: () => 'markov'}));

const queue = 'markov://queue';
const registration = {queue, vital: false};
const data: ConsumerStatusData = {
    queue_consumer_names: ['one', 'two', 'broken', 'empty'],
    consumers: {
        one: {registrations: [registration], queue_agent_host: 'host-one'},
        two: {registrations: [{queue, vital: true}], queue_agent_host: 'host-two'},
        broken: {error: {code: 1, message: 'Consumer failed'}},
        empty: {registrations: []},
    },
};

function createState(consumerName?: string, consumerData = data) {
    return {
        navigation: {
            tabs: {
                consumer: {
                    filters: {consumerName, consumerPartitionIndex: '', targetQueue: undefined},
                    status: {consumerData},
                    partitions: {},
                },
            },
        },
    } as unknown as RootState;
}

describe('consumer selection', () => {
    it('keeps ordinary consumers working and selects their only queue', () => {
        const state = createState(undefined, {registrations: [registration]});
        expect(selectIsMultiConsumer(state)).toBe(false);
        expect(selectConsumerName(state)).toBeUndefined();
        expect(selectTargetQueue(state)).toEqual(registration);
    });

    it('selects the requested consumer and uses its registrations and host', () => {
        const state = createState('two');
        expect(selectIsMultiConsumer(state)).toBe(true);
        expect(selectConsumerName(state)).toBe('two');
        expect(selectTargetQueue(state)?.vital).toBe(true);
        expect(selectQueueAgentHost(state)).toBe('host-two');
    });

    it('falls back to the first name when absent or removed', () => {
        expect(selectConsumerName(createState())).toBe('one');
        expect(selectConsumerName(createState('removed'))).toBe('one');
    });

    it('isolates an error of the selected consumer', () => {
        expect(selectConsumerError(createState('broken'))?.message).toBe('Consumer failed');
        expect(selectTargetQueue(createState('broken'))).toBeUndefined();
        expect(selectConsumerError(createState('one'))).toBeUndefined();
    });

    it('handles empty registrations', () => {
        expect(selectConsumerRegisteredQueues(createState('empty'))).toEqual([]);
        expect(selectTargetQueue(createState('empty'))).toBeUndefined();
    });

    it('keeps multi-consumer mode without names and does not read root registrations', () => {
        const state = createState(undefined, {
            queue_consumer_names: [],
            consumers: {},
            registrations: [registration],
        });

        expect(selectIsMultiConsumer(state)).toBe(true);
        expect(selectConsumerName(state)).toBeUndefined();
        expect(selectConsumerRegisteredQueues(state)).toBeUndefined();
        expect(selectTargetQueue(state)).toBeUndefined();
    });

    it('does not display partitions from another consumer even for the same queue', () => {
        const state = createState('two');
        state.navigation.tabs.consumer.partitions = {
            requestKey: selectConsumerPartitionsRequestKey(createState('one')),
            partitionsData: [{next_row_index: 123}] as never,
            partitionsError: null,
            partitionsLoading: false,
            partitionsLoaded: true,
        };
        expect(selectPartitions(state)).toEqual([]);
    });
});
