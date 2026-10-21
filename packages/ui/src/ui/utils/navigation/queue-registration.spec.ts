import {formatQueueRegistrationPath, parseQueueRegistrationPath} from './queue-registration';

describe('queue registration paths', () => {
    it('preserves colons inside a legacy path', () => {
        expect(parseQueueRegistrationPath('test-cluster://home/a:b')).toEqual({
            cluster: 'test-cluster',
            path: '//home/a:b',
            consumerName: undefined,
        });
    });

    it('reads attributes of a named consumer without parsing its name as a path', () => {
        const value = {
            $value: '//home/consumer',
            $attributes: {cluster: 'test-cluster', queue_consumer_name: 'a/b:@name'},
        };
        expect(parseQueueRegistrationPath(value)).toEqual({
            cluster: 'test-cluster',
            path: '//home/consumer',
            consumerName: 'a/b:@name',
        });
        expect(formatQueueRegistrationPath(value)).toBe('test-cluster://home/consumer (a/b:@name)');
    });

    it('supports attributed queues and unnamed consumers', () => {
        expect(
            formatQueueRegistrationPath({
                $value: '//home/q',
                $attributes: {cluster: 'test-cluster'},
            }),
        ).toBe('test-cluster://home/q');
        expect(formatQueueRegistrationPath('test-cluster://home/q')).toBe('test-cluster://home/q');
    });
});
