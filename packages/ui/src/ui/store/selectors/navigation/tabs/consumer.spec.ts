import {type RootState} from '../../../reducers';
import {type ConsumerStatusData} from '../../../reducers/navigation/tabs/consumer/status';
import {
    selectConsumerError,
    selectConsumerName,
    selectConsumerPartitionsRequestKey,
    selectConsumerRegisteredQueues,
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

function state(consumerName?: string, consumerData = data) {
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
        const s = state(undefined, {registrations: [registration]});
        expect(selectConsumerName(s)).toBeUndefined();
        expect(selectTargetQueue(s)).toEqual(registration);
    });

    it('selects the requested consumer and uses its registrations and host', () => {
        const s = state('two');
        expect(selectConsumerName(s)).toBe('two');
        expect(selectTargetQueue(s)?.vital).toBe(true);
        expect(selectQueueAgentHost(s)).toBe('host-two');
    });

    it('falls back to the first name when absent or removed', () => {
        expect(selectConsumerName(state())).toBe('one');
        expect(selectConsumerName(state('removed'))).toBe('one');
    });

    it('isolates an error of the selected consumer', () => {
        expect(selectConsumerError(state('broken'))?.message).toBe('Consumer failed');
        expect(selectTargetQueue(state('broken'))).toBeUndefined();
        expect(selectConsumerError(state('one'))).toBeUndefined();
    });

    it('handles empty registrations and consumer names', () => {
        expect(selectConsumerRegisteredQueues(state('empty'))).toEqual([]);
        expect(selectTargetQueue(state('empty'))).toBeUndefined();
        expect(
            selectConsumerName(state(undefined, {queue_consumer_names: [], consumers: {}})),
        ).toBeUndefined();
    });

    it('does not display partitions from another consumer even for the same queue', () => {
        const s = state('two');
        s.navigation.tabs.consumer.partitions = {
            requestKey: selectConsumerPartitionsRequestKey(state('one')),
            partitionsData: [{next_row_index: 123}] as never,
            partitionsError: null,
            partitionsLoading: false,
            partitionsLoaded: true,
        };
        expect(selectPartitions(s)).toEqual([]);
    });
});
