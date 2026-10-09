import {formatQueueRegistrationPath, parseQueueRegistrationPath} from './queue-registration';

describe('queue registration paths', () => {
    it('preserves colons inside a legacy path', () => {
        expect(parseQueueRegistrationPath('markov://home/a:b')).toEqual({
            cluster: 'markov',
            path: '//home/a:b',
            consumerName: undefined,
        });
    });

    it('reads attributes of a named consumer without parsing its name as a path', () => {
        const value = {
            $value: '//home/consumer',
            $attributes: {cluster: 'markov', queue_consumer_name: 'a/b:@name'},
        };
        expect(parseQueueRegistrationPath(value)).toEqual({
            cluster: 'markov',
            path: '//home/consumer',
            consumerName: 'a/b:@name',
        });
        expect(formatQueueRegistrationPath(value)).toBe('markov://home/consumer (a/b:@name)');
    });

    it('supports attributed queues and unnamed consumers', () => {
        expect(
            formatQueueRegistrationPath({$value: '//home/q', $attributes: {cluster: 'markov'}}),
        ).toBe('markov://home/q');
        expect(formatQueueRegistrationPath('markov://home/q')).toBe('markov://home/q');
    });
});
