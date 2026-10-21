import {type RootState} from '../../../reducers';
import {selectConsumers} from './queue';

function createState(queueConsumerName: string, registrations: unknown[]) {
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
            {consumer: 'test-cluster://home/queues/primary'},
            {consumer: 'test-cluster://home/queues/analytics'},
        ];

        expect(
            selectConsumers(createState('/queues/analytics', registrations)).map(
                ({consumer}) => consumer,
            ),
        ).toEqual([registrations[1].consumer]);
    });

    it('filters attributed registrations by consumer name', () => {
        const registrations = [
            {consumer: 'test-cluster://legacy'},
            {
                consumer: {
                    $value: '//multi',
                    $attributes: {cluster: 'test-cluster', queue_consumer_name: 'two'},
                },
            },
            {
                consumer: {
                    $value: '//multi',
                    $attributes: {cluster: 'test-cluster', queue_consumer_name: 'one'},
                },
            },
        ];

        expect(
            selectConsumers(createState('two', registrations)).map(({consumer}) => consumer),
        ).toEqual([registrations[1].consumer]);
    });
});
