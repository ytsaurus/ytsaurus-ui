import {type RootState} from '../../../reducers';
import {selectConsumers} from './queue';

function state(queueConsumerName: string, registrations: unknown[]) {
    return {
        navigation: {
            tabs: {
                queue: {
                    filters: {queueConsumerName},
                    status: {statusData: {registrations}},
                },
            },
        },
    } as unknown as RootState;
}

describe('queue consumer selection', () => {
    it('filters registrations by path', () => {
        const registrations = [
            {consumer: 'markov://home/queues/primary'},
            {consumer: 'markov://home/queues/analytics'},
        ];

        expect(selectConsumers(state('/queues/analytics', registrations))).toHaveLength(1);
    });

    it('filters attributed registrations by consumer name', () => {
        const registrations = [
            {consumer: 'markov://legacy'},
            {
                consumer: {
                    $value: '//multi',
                    $attributes: {cluster: 'markov', queue_consumer_name: 'two'},
                },
            },
            {
                consumer: {
                    $value: '//multi',
                    $attributes: {cluster: 'markov', queue_consumer_name: 'one'},
                },
            },
        ];

        expect(selectConsumers(state('two', registrations))).toHaveLength(1);
    });
});
