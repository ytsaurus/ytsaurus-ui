import {escapeChars, formatByParams, formatByParamsQuotedEnv} from './format';

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

    describe('keyToRegex', () => {
        const keyToRegex = (key: string) => new RegExp(`\\$${key}`, 'g');

        test('test 1', () => {
            expect(formatByParams('hello $user', {user: 'world'}, {keyToRegex})).toBe(
                'hello world',
            );
        });

        test('test 2', () => {
            expect(
                formatByParams('$param1 $param2', {param1: 'hello', param2: 'world'}, {keyToRegex}),
            ).toBe('hello world');
        });

        test('test 3', () => {
            expect(formatByParams('$a > $b, $b < $a', {a: 2, b: 1}, {keyToRegex})).toBe(
                '2 > 1, 1 < 2',
            );
        });
    });
});

describe('formatByPramsEnv', () => {
    test('test 1', () => {
        expect(formatByParamsQuotedEnv('hello "$user"', {user: 'world'})).toBe('hello "world"');
    });

    test('test 2', () => {
        expect(
            formatByParamsQuotedEnv('"$param1" "$param2"', {param1: 'hello', param2: 'world'}),
        ).toBe('"hello" "world"');
    });

    test('test 3', () => {
        expect(formatByParamsQuotedEnv('"$a" > "$b", "$b" < "$a"', {a: 2, b: 1})).toBe(
            '"2" > "1", "1" < "2"',
        );
    });

    test('sanitize', () => {
        expect(
            formatByParamsQuotedEnv(
                '"$a" != "$b"',
                {a: '<Root>', b: 'yt/cron'},
                {sanitizeParams: encodeURIComponent},
            ),
        ).toBe('"%3CRoot%3E" != "yt%2Fcron"');
    });
});

describe('escapeChars', () => {
    test('test 1', () => {
        expect(escapeChars('_\\"_')).toBe('_\\\\\\"_');
    });
});
