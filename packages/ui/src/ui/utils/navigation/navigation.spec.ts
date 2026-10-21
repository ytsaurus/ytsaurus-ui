import {findCommonPathParent, genNavigationUrl} from './navigation';

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

    it('encodes named-consumer query parameters', () => {
        const url = genNavigationUrl({
            cluster: 'test-cluster',
            path: '//consumer',
            queryParams: {tab: 'consumer', cName: 'a/b&c=# тест', unused: undefined},
        });
        const params = new URL(url, 'https://example.test').searchParams;

        expect(params.get('tab')).toBe('consumer');
        expect(params.get('cName')).toBe('a/b&c=# тест');
        expect(params.has('unused')).toBe(false);
    });
});
