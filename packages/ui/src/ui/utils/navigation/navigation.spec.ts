import {findCommonPathParent, genConsumerNavigationUrl, genNavigationUrl} from './navigation';

describe('findCommonPathParent', () => {
    test('test 0', () => {
        expect(findCommonPathParent('//home/some/path/table1', '//home/some/path/table0')).toBe(
            '//home/some/path/',
        );
    });

    test('test 1', () => {
        expect(findCommonPathParent('//home/some/path/table1', '//home/some/path1/table0')).toBe(
            '//home/some/',
        );
    });

    test('test 2', () => {
        expect(findCommonPathParent('//home/some/path/table1', '//home/some1/path/table0')).toBe(
            '//home/',
        );
    });

    test('test 3', () => {
        expect(findCommonPathParent('//home/some/path/table1', '//home1/some/path/table0')).toBe(
            '//',
        );
    });
});

describe('genNavigationUrl', () => {
    it('preserves links without additional query parameters', () => {
        expect(
            genNavigationUrl({cluster: 'test-cluster', path: '//consumer', transaction: 'tx'}),
        ).toBe('/test-cluster/navigation?path=//consumer&t=tx');
    });
});

describe('genConsumerNavigationUrl', () => {
    it('preserves links without a consumer name', () => {
        expect(
            genConsumerNavigationUrl({
                cluster: 'test-cluster',
                path: '//consumer',
                transaction: 'tx',
            }),
        ).toBe('/test-cluster/navigation?path=//consumer&t=tx');
    });

    it.each(['a/b&c=# тест', ''])(
        'encodes consumer name %j and preserves navigation parameters',
        (consumerName) => {
            const url = genConsumerNavigationUrl({
                cluster: 'test-cluster',
                path: '//consumer',
                transaction: 'tx',
                consumerName,
            });
            const parsedUrl = new URL(url, 'https://example.test');

            expect(parsedUrl.pathname).toBe('/test-cluster/navigation');
            expect(Object.fromEntries(parsedUrl.searchParams)).toEqual({
                path: '//consumer',
                t: 'tx',
                tab: 'consumer',
                cName: consumerName,
            });
        },
    );
});
