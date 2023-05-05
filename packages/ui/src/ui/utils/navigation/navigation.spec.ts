import {findCommonPathParent} from './navigation';

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
