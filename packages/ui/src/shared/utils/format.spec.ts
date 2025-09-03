import {formatByParams, formatByPramsQuotedEnv} from './format';

describe('formatByParams', () => {
    test('test 1', () => {
        expect(formatByParams('hello {user}', {user: 'world'})).toBe('hello world');
    });

    test('test 2', () => {
        expect(formatByParams('{param1} {param2}', {param1: 'hello', param2: 'world'})).toBe(
            'hello world',
        );
    });

    test('test 3', () => {
        expect(formatByParams('{a} > {b}, {b} < {a}', {a: 2, b: 1})).toBe('2 > 1, 1 < 2');
    });
});

describe('formatByPramsEnv', () => {
    test('test 1', () => {
        expect(formatByPramsQuotedEnv('hello "$user"', {user: 'world'})).toBe('hello "world"');
    });

    test('test 2', () => {
        expect(
            formatByPramsQuotedEnv('"$param1" "$param2"', {param1: 'hello', param2: 'world'}),
        ).toBe('"hello" "world"');
    });

    test('test 3', () => {
        expect(formatByPramsQuotedEnv('"$a" > "$b", "$b" < "$a"', {a: 2, b: 1})).toBe(
            '"2" > "1", "1" < "2"',
        );
    });
});
