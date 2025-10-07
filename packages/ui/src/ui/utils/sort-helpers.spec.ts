import {
    compareArraysBySizeThenByItems,
    compareVectors,
    compareWithUndefined,
    multiSortWithUndefined,
    nextSortOrderValue,
    oldSortStateToOrderType,
    orderTypeToOldSortState,
    orderTypeToOrderK,
    sortArrayBySortState,
    sortItemsBySchema,
} from './sort-helpers';

function createItems(str: string) {
    return str.split('').map((item) => ({
        name: item,
    }));
}

describe('sortItemsBySchema', () => {
    const schema = createItems('sort');
    const schemaCopy = createItems('sort');

    it('should sort correctly', () => {
        const items = createItems('rost');
        const res = sortItemsBySchema(items, schema);

        expect(res).toBe(items);
        expect(res).toEqual(createItems('sort'));
        expect(schema).toEqual(schemaCopy);
    });

    it('should sort correctly when there are some extra elements which are not present in schema', () => {
        const items = createItems('storzbl');
        const res = sortItemsBySchema(items, schema);

        expect(res).toBe(items);
        expect(res).toEqual(createItems('sortblz'));
        expect(schema).toEqual(schemaCopy);
    });

    it('should sort correctly when there are some missing elements from schema', () => {
        const items = createItems('tosya');
        const res = sortItemsBySchema(items, schema);

        expect(res).toBe(items);
        expect(res).toEqual(createItems('sotay'));
        expect(schema).toEqual(schemaCopy);
    });

    it('should sort alphabetically when there are only missing elements', () => {
        const items = createItems('yandex');
        const res = sortItemsBySchema(items, schema);

        expect(res).toBe(items);
        expect(res).toEqual(createItems('adenxy'));
        expect(schema).toEqual(schemaCopy);
    });
});

describe('compareArraysBySizeThenByItems', () => {
    const arr = ['abc', 'def', 'ghi'];

    describe('Check equality', () => {
        it('test 0', () => {
            expect(compareArraysBySizeThenByItems([], [])).toBe(0);
        });

        it('test 1', () => {
            expect(compareArraysBySizeThenByItems(arr, [...arr])).toBe(0);
        });

        it('test 2', () => {
            const a = arr.slice(0, arr.length - 1);
            expect(compareArraysBySizeThenByItems([...a], [...a])).toBe(0);
        });

        it('test 3', () => {
            const a = arr.slice(0, arr.length - 2);
            expect(compareArraysBySizeThenByItems([...a], [...a])).toBe(0);
        });
    });

    describe('should be LESS when size is smaller', () => {
        it('test 0', () => {
            const other = ['', ...arr];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });

        it('test 1', () => {
            const other = ['aaa', ...arr];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });

        it('test 2', () => {
            const other = ['zzz', ...arr];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });

        it('test 3', () => {
            const other = [...arr, ''];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });

        it('test 4', () => {
            const other = [...arr, 'aaa'];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });

        it('test 5', () => {
            const other = [...arr, 'zzz'];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });
    });

    describe('shoud be GREATER when size is greater', () => {
        it('test 0', () => {
            const other = arr.slice(0, arr.length - 1);
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 1', () => {
            const other = arr.slice(0, arr.length - 2);
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 2', () => {
            const other = arr.slice(0, arr.length - 3);
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 3', () => {
            const other = arr.slice(1, arr.length);
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 4', () => {
            const other = arr.slice(2, arr.length);
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 5', () => {
            const other = arr.slice(3, arr.length);
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });
    });

    describe('should be compared by elements if size is equals', () => {
        it('test 0', () => {
            const other = ['aabc', 'def', 'ghi'];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 1', () => {
            const other = ['abc', 'adef', 'ghi'];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 2', () => {
            const other = ['abc', 'def', 'aghi'];
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(-1);
        });

        it('test 3', () => {
            const other = [...arr].reverse();
            expect(compareArraysBySizeThenByItems(arr, other)).toBe(-1);
            expect(compareArraysBySizeThenByItems(other, arr)).toBe(1);
        });
    });
});

describe('multiSortWithUndefined', () => {
    const data: Array<{
        nodes?: number;
        type?: string;
        name: string;
        index: number;
    }> = [];
    beforeEach(() => {
        data.splice(0, data.length);
        /**
         * 'index' field is required to make simulate stable sort
         */
        data.push(
            {nodes: 30, type: 'test', name: '30_test', index: 0},
            {nodes: 20, type: 'test', name: '20_test', index: 1},
            {nodes: 10, type: 'test', name: '10_test', index: 2},

            {nodes: 30, type: 'pre', name: '30_pre', index: 3},
            {nodes: 20, type: 'pre', name: '20_pre', index: 4},
            {nodes: 10, type: 'pre', name: '10_pre', index: 5},

            {nodes: 30, type: 'dev', name: '30_dev', index: 6},
            {nodes: 20, type: 'dev', name: '20_dev', index: 7},
            {nodes: 10, type: 'dev', name: '10_dev', index: 8},

            {nodes: 30, type: 'prod', name: '30_prod', index: 9},
            {nodes: 20, type: 'prod', name: '20_prod', index: 10},
            {nodes: 10, type: 'prod', name: '10_prod', index: 11},

            {type: 'prod', name: 'prod', index: 12},
            {type: 'test', name: 'test', index: 13},
            {type: 'dev', name: 'dev', index: 14},

            {nodes: 30, name: '30', index: 15},
            {nodes: 20, name: '20', index: 16},
            {nodes: 10, name: '10', index: 17},

            {name: '', index: 18},
        );
    });

    it('should be sorted by ["nodes"]', () => {
        const res = multiSortWithUndefined(data, ['nodes', 'index']);
        expect(res.map(({name}) => name)).toEqual([
            '10_test',
            '10_pre',
            '10_dev',
            '10_prod',
            '10',
            '20_test',
            '20_pre',
            '20_dev',
            '20_prod',
            '20',
            '30_test',
            '30_pre',
            '30_dev',
            '30_prod',
            '30',
            'prod',
            'test',
            'dev',
            '',
        ]);
    });

    it('should be sorted by ["nodes:desc"]', () => {
        const res = multiSortWithUndefined(data, [{key: 'nodes', orderK: -1}, 'index']);
        expect(res.map(({name}) => name)).toEqual([
            '30_test',
            '30_pre',
            '30_dev',
            '30_prod',
            '30',
            '20_test',
            '20_pre',
            '20_dev',
            '20_prod',
            '20',
            '10_test',
            '10_pre',
            '10_dev',
            '10_prod',
            '10',
            'prod',
            'test',
            'dev',
            '',
        ]);
    });

    it('should be sorted by ["nodes", "type"]', () => {
        const res = multiSortWithUndefined(data, ['nodes', 'type', 'index']);
        expect(res.map(({name}) => name)).toEqual([
            '10_dev',
            '10_pre',
            '10_prod',
            '10_test',
            '10',

            '20_dev',
            '20_pre',
            '20_prod',
            '20_test',
            '20',

            '30_dev',
            '30_pre',
            '30_prod',
            '30_test',
            '30',

            'dev',
            'prod',
            'test',
            '',
        ]);
    });

    it('should be sorted by ["nodes:desc", "type:desc"]', () => {
        const res = multiSortWithUndefined(data, [
            {key: 'nodes', orderK: -1},
            {key: 'type', orderK: -1},
            'index',
        ]);
        expect(res.map(({name}) => name)).toEqual([
            '30_test',
            '30_prod',
            '30_pre',
            '30_dev',
            '30',

            '20_test',
            '20_prod',
            '20_pre',
            '20_dev',
            '20',

            '10_test',
            '10_prod',
            '10_pre',
            '10_dev',
            '10',

            'test',
            'prod',
            'dev',
            '',
        ]);
    });

    it('should be sorted by ["nodes: desc", "type"]', () => {
        const res = multiSortWithUndefined(data, [{key: 'nodes', orderK: -1}, 'type', 'index']);
        expect(res.map(({name}) => name)).toEqual([
            '30_dev',
            '30_pre',
            '30_prod',
            '30_test',
            '30',

            '20_dev',
            '20_pre',
            '20_prod',
            '20_test',
            '20',

            '10_dev',
            '10_pre',
            '10_prod',
            '10_test',
            '10',

            'dev',
            'prod',
            'test',
            '',
        ]);
    });

    it('should be sorted by ["nodes", "type:desc"]', () => {
        const res = multiSortWithUndefined(data, [
            {key: 'nodes', orderK: 1},
            {key: 'type', orderK: -1},
            'index',
        ]);
        expect(res.map(({name}) => name)).toEqual([
            '10_test',
            '10_prod',
            '10_pre',
            '10_dev',
            '10',

            '20_test',
            '20_prod',
            '20_pre',
            '20_dev',
            '20',

            '30_test',
            '30_prod',
            '30_pre',
            '30_dev',
            '30',

            'test',
            'prod',
            'dev',
            '',
        ]);
    });

    describe('with undefinedOrderK == -1: ', () => {
        it('should be sorted by ["nodes"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                'prod',
                'test',
                'dev',
                '',
                '10_test',
                '10_pre',
                '10_dev',
                '10_prod',
                '10',
                '20_test',
                '20_pre',
                '20_dev',
                '20_prod',
                '20',
                '30_test',
                '30_pre',
                '30_dev',
                '30_prod',
                '30',
            ]);
        });

        it('should be sorted by ["nodes:desc"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', orderK: -1, undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                'prod',
                'test',
                'dev',
                '',
                '30_test',
                '30_pre',
                '30_dev',
                '30_prod',
                '30',
                '20_test',
                '20_pre',
                '20_dev',
                '20_prod',
                '20',
                '10_test',
                '10_pre',
                '10_dev',
                '10_prod',
                '10',
            ]);
        });

        it('should be sorted by ["nodes", "type"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', undefinedOrderK: -1},
                {key: 'type', undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                '',
                'dev',
                'prod',
                'test',

                '10',
                '10_dev',
                '10_pre',
                '10_prod',
                '10_test',

                '20',
                '20_dev',
                '20_pre',
                '20_prod',
                '20_test',

                '30',
                '30_dev',
                '30_pre',
                '30_prod',
                '30_test',
            ]);
        });

        it('should be sorted by ["nodes:desc", "type:desc"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', orderK: -1, undefinedOrderK: -1},
                {key: 'type', orderK: -1, undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                '',
                'test',
                'prod',
                'dev',

                '30',
                '30_test',
                '30_prod',
                '30_pre',
                '30_dev',

                '20',
                '20_test',
                '20_prod',
                '20_pre',
                '20_dev',

                '10',
                '10_test',
                '10_prod',
                '10_pre',
                '10_dev',
            ]);
        });

        it('should be sorted by ["nodes: desc", "type"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', orderK: -1, undefinedOrderK: -1},
                {key: 'type', undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                '',
                'dev',
                'prod',
                'test',

                '30',
                '30_dev',
                '30_pre',
                '30_prod',
                '30_test',

                '20',
                '20_dev',
                '20_pre',
                '20_prod',
                '20_test',

                '10',
                '10_dev',
                '10_pre',
                '10_prod',
                '10_test',
            ]);
        });

        it('should be sorted by ["nodes", "type:desc"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', orderK: 1, undefinedOrderK: -1},
                {key: 'type', orderK: -1, undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                '',
                'test',
                'prod',
                'dev',

                '10',
                '10_test',
                '10_prod',
                '10_pre',
                '10_dev',

                '20',
                '20_test',
                '20_prod',
                '20_pre',
                '20_dev',

                '30',
                '30_test',
                '30_prod',
                '30_pre',
                '30_dev',
            ]);
        });
    });

    describe('with different undefinedOrderK', () => {
        it('should be sorted by ["nodes:undefinedOrderK=-1", "type"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes', undefinedOrderK: -1},
                'type',
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                'dev',
                'prod',
                'test',
                '',

                '10_dev',
                '10_pre',
                '10_prod',
                '10_test',
                '10',

                '20_dev',
                '20_pre',
                '20_prod',
                '20_test',
                '20',

                '30_dev',
                '30_pre',
                '30_prod',
                '30_test',
                '30',
            ]);
        });

        it('should be sorted by ["nodes", "type:undefinedOrderK=-1"]', () => {
            const res = multiSortWithUndefined(data, [
                {key: 'nodes'},
                {key: 'type', undefinedOrderK: -1},
                'index',
            ]);
            expect(res.map(({name}) => name)).toEqual([
                '10',
                '10_dev',
                '10_pre',
                '10_prod',
                '10_test',

                '20',
                '20_dev',
                '20_pre',
                '20_prod',
                '20_test',

                '30',
                '30_dev',
                '30_pre',
                '30_prod',
                '30_test',

                '',
                'dev',
                'prod',
                'test',
            ]);
        });
    });

    describe('nextSortOrderValue', () => {
        describe('skip unordered', () => {
            it('after asc', () => {
                expect(nextSortOrderValue('asc')).toBe('desc');
            });

            it('after desc', () => {
                expect(nextSortOrderValue('desc')).toBe('asc');
            });

            it('after unordered', () => {
                expect(nextSortOrderValue('')).toBe('asc');
            });

            it('after undefined', () => {
                expect(nextSortOrderValue()).toBe('asc');
            });
        });
        describe('allow unordered', () => {
            it('after asc', () => {
                expect(nextSortOrderValue('asc', true)).toBe('desc');
            });

            it('after desc', () => {
                expect(nextSortOrderValue('desc', true)).toBe('');
            });

            it('after unordered', () => {
                expect(nextSortOrderValue('', true)).toBe('asc');
            });

            it('after undefined', () => {
                expect(nextSortOrderValue(undefined, true)).toBe('asc');
            });
        });

        describe('with undefined', () => {
            describe('skip unordered', () => {
                it('after asc, asc-undefined', () => {
                    expect(nextSortOrderValue('asc', false, true)).toBe('desc-undefined');
                    expect(nextSortOrderValue('asc-undefined', false, true)).toBe('desc-undefined');
                });

                it('after desc, asc-undefined', () => {
                    expect(nextSortOrderValue('desc', false, true)).toBe('undefined-asc');
                    expect(nextSortOrderValue('desc-undefined', false, true)).toBe('undefined-asc');
                });

                it('after undefined-asc', () => {
                    expect(nextSortOrderValue('undefined-asc', false, true)).toBe('undefined-desc');
                });

                it('after undefined-desc', () => {
                    expect(nextSortOrderValue('undefined-desc', false, true)).toBe('asc-undefined');
                });

                it('after unordered', () => {
                    expect(nextSortOrderValue('', false, true)).toBe('asc-undefined');
                });

                it('after undefined', () => {
                    expect(nextSortOrderValue(undefined, undefined, true)).toBe('asc-undefined');
                });
            });
            describe('allow unordered', () => {
                it('after asc, asc-undefined', () => {
                    expect(nextSortOrderValue('asc', true, true)).toBe('desc-undefined');
                    expect(nextSortOrderValue('asc-undefined', true, true)).toBe('desc-undefined');
                });

                it('after desc, asc-undefined', () => {
                    expect(nextSortOrderValue('desc', true, true)).toBe('undefined-asc');
                    expect(nextSortOrderValue('desc-undefined', true, true)).toBe('undefined-asc');
                });

                it('after undefined-asc', () => {
                    expect(nextSortOrderValue('undefined-asc', true, true)).toBe('undefined-desc');
                });

                it('after undefined-desc', () => {
                    expect(nextSortOrderValue('undefined-desc', true, true)).toBe('');
                });

                it('after unordered', () => {
                    expect(nextSortOrderValue('', true, true)).toBe('asc-undefined');
                });

                it('after undefined', () => {
                    expect(nextSortOrderValue(undefined, true, true)).toBe('asc-undefined');
                });
            });
        });
    });

    describe('orderTypeToOrderK', () => {
        it('asc, asc-undefined', () => {
            expect(orderTypeToOrderK('asc')).toEqual({
                orderK: 1,
                undefinedOrderK: 1,
            });
            expect(orderTypeToOrderK('asc-undefined')).toEqual({
                orderK: 1,
                undefinedOrderK: 1,
            });
        });

        it('desc, desc-undefined', () => {
            expect(orderTypeToOrderK('desc')).toEqual({
                orderK: -1,
                undefinedOrderK: 1,
            });
            expect(orderTypeToOrderK('desc-undefined')).toEqual({
                orderK: -1,
                undefinedOrderK: 1,
            });
        });

        it('undefined-asc', () => {
            expect(orderTypeToOrderK('undefined-asc')).toEqual({
                orderK: 1,
                undefinedOrderK: -1,
            });
        });

        it('after undefined-desc', () => {
            expect(orderTypeToOrderK('undefined-desc')).toEqual({
                orderK: -1,
                undefinedOrderK: -1,
            });
        });

        it('unordered', () => {
            expect(orderTypeToOrderK('')).toEqual({
                orderK: 1,
                undefinedOrderK: 1,
            });
        });

        it('undefined', () => {
            expect(orderTypeToOrderK(undefined)).toEqual({
                orderK: 1,
                undefinedOrderK: 1,
            });
        });
    });

    describe('sortArrayBySortState', () => {
        let array: Array<{a: number | undefined}> = [];
        let arrayBackup: typeof array = [];
        beforeEach(() => {
            array = [];
            array.push({a: 10}, {a: 20}, {a: undefined}, {a: 15});
            arrayBackup = array.slice();
        });

        it('asc, asc-undefined', () => {
            const expectation = [{a: 10}, {a: 15}, {a: 20}, {a: undefined}];

            expect(array).toEqual(arrayBackup);

            expect(sortArrayBySortState(array, {column: 'a', order: 'asc'})).toEqual(expectation);
            expect(
                sortArrayBySortState(array, {
                    column: 'a',
                    order: 'asc-undefined',
                }),
            ).toEqual(expectation);
        });

        it('desc, desc-undefined', () => {
            const expectation = [{a: 20}, {a: 15}, {a: 10}, {a: undefined}];

            expect(array).toEqual(arrayBackup);

            expect(sortArrayBySortState(array, {column: 'a', order: 'desc'})).toEqual(expectation);
            expect(
                sortArrayBySortState(array, {
                    column: 'a',
                    order: 'desc-undefined',
                }),
            ).toEqual(expectation);
        });

        it('undefined-asc', () => {
            const expectation = [{a: undefined}, {a: 10}, {a: 15}, {a: 20}];

            expect(array).toEqual(arrayBackup);

            expect(
                sortArrayBySortState(array, {
                    column: 'a',
                    order: 'undefined-asc',
                }),
            ).toEqual(expectation);
        });

        it('undefined-desc', () => {
            const expectation = [{a: undefined}, {a: 20}, {a: 15}, {a: 10}];

            expect(array).toEqual(arrayBackup);

            expect(
                sortArrayBySortState(array, {
                    column: 'a',
                    order: 'undefined-desc',
                }),
            ).toEqual(expectation);
        });

        it('no sortState', () => {
            const res = sortArrayBySortState(array);

            expect(res).toBe(array);
            expect(res).toEqual(arrayBackup);
        });

        it('no column', () => {
            const res = sortArrayBySortState(array, {order: 'asc'});

            expect(res).toBe(array);
            expect(res).toEqual(arrayBackup);
        });

        it('no order', () => {
            const res = sortArrayBySortState(array, {column: 'a'});

            expect(res).toBe(array);
            expect(res).toEqual(arrayBackup);
        });
    });

    describe('oldSortStateToOrderType', () => {
        it('no sort state', () => {
            expect(oldSortStateToOrderType()).toBe('');
            expect(oldSortStateToOrderType({asc: true})).toBe('');
            expect(oldSortStateToOrderType({field: 'a'} as any)).toBe('');
        });

        it('asc', () => {
            expect(oldSortStateToOrderType({field: 'a', asc: true})).toBe('asc');
        });

        it('desc', () => {
            expect(oldSortStateToOrderType({field: 'a', asc: false})).toBe('desc');
        });

        it('asc-undefined', () => {
            expect(
                oldSortStateToOrderType({
                    field: 'a',
                    asc: true,
                    undefinedAsc: true,
                }),
            ).toBe('asc-undefined');
        });

        it('desc-undefined', () => {
            expect(
                oldSortStateToOrderType({
                    field: 'a',
                    asc: false,
                    undefinedAsc: true,
                }),
            ).toBe('desc-undefined');
        });

        it('undefined-asc', () => {
            expect(
                oldSortStateToOrderType({
                    field: 'a',
                    asc: true,
                    undefinedAsc: false,
                }),
            ).toBe('undefined-asc');
        });

        it('undefined-desc', () => {
            expect(
                oldSortStateToOrderType({
                    field: 'a',
                    asc: false,
                    undefinedAsc: false,
                }),
            ).toBe('undefined-desc');
        });
    });

    describe('orderTypeToOldSortState', () => {
        it('no order type', () => {
            expect(orderTypeToOldSortState('')).toEqual({});
        });

        it('asc', () => {
            expect(orderTypeToOldSortState('a', 'asc')).toEqual({
                field: 'a',
                asc: true,
            });
        });

        it('desc', () => {
            expect(orderTypeToOldSortState('a', 'desc')).toEqual({
                field: 'a',
                asc: false,
            });
        });

        it('asc-undefined', () => {
            expect(orderTypeToOldSortState('a', 'asc-undefined')).toEqual({
                field: 'a',
                asc: true,
                undefinedAsc: true,
            });
        });

        it('desc-undefined', () => {
            expect(orderTypeToOldSortState('a', 'desc-undefined')).toEqual({
                field: 'a',
                asc: false,
                undefinedAsc: true,
            });
        });

        it('undefined-asc', () => {
            expect(orderTypeToOldSortState('a', 'undefined-asc')).toEqual({
                field: 'a',
                asc: true,
                undefinedAsc: false,
            });
        });

        it('undefined-desc', () => {
            expect(orderTypeToOldSortState('a', 'undefined-desc')).toEqual({
                field: 'a',
                asc: false,
                undefinedAsc: false,
            });
        });
    });

    describe('compareVectors', () => {
        it('undefined & undefined', () => {
            expect(compareVectors(undefined, undefined, 1, 1)).toBe(0);
            expect(compareVectors(undefined, undefined, -1, 1)).toBe(0);
            expect(compareVectors(undefined, undefined, 1, -1)).toBe(0);
            expect(compareVectors(undefined, undefined, -1, -1)).toBe(0);
        });

        it('undefined & [undefined]', () => {
            expect(compareVectors(undefined, [undefined], 1, 1)).toBe(0);
            expect(compareVectors(undefined, [undefined], -1, 1)).toBe(0);
            expect(compareVectors(undefined, [undefined], 1, -1)).toBe(0);
            expect(compareVectors(undefined, [undefined], -1, -1)).toBe(0);
        });

        it('1 & 2', () => {
            expect(compareVectors(1, 2, 1, 1)).toBe(-1);
            expect(compareVectors(1, 2, -1, 1)).toBe(1);
            expect(compareVectors(1, 2, 1, -1)).toBe(-1);
            expect(compareVectors(1, 2, -1, -1)).toBe(1);
        });

        it('[1,3] & [1,2]', () => {
            expect(compareVectors([1, 3], [1, 2], 1, 1)).toBe(1);
            expect(compareVectors([1, 3], [1, 2], -1, 1)).toBe(-1);
            expect(compareVectors([1, 3], [1, 2], 1, -1)).toBe(1);
            expect(compareVectors([1, 3], [1, 2], -1, -1)).toBe(-1);
        });

        it('undefined & [1,2,3]', () => {
            expect(compareVectors(undefined, [1, 2], 1, 1)).toBe(1);
            expect(compareVectors(undefined, [1, 2], -1, 1)).toBe(1);
            expect(compareVectors(undefined, [1, 2], 1, -1)).toBe(-1);
            expect(compareVectors(undefined, [1, 2], -1, -1)).toBe(-1);
        });

        it('[1,2,3] & [1,2]', () => {
            expect(compareVectors([1, 2, 3], [1, 2], 1, 1)).toBe(-1);
            expect(compareVectors([1, 2, 3], [1, 2], -1, 1)).toBe(-1);
            expect(compareVectors([1, 2, 3], [1, 2], 1, -1)).toBe(1);
            expect(compareVectors([1, 2, 3], [1, 2], -1, -1)).toBe(1);
        });

        it('1 & [1]', () => {
            expect(compareVectors(undefined, undefined, 1, 1)).toBe(0);
            expect(compareVectors(undefined, undefined, -1, 1)).toBe(0);
            expect(compareVectors(undefined, undefined, 1, -1)).toBe(0);
            expect(compareVectors(undefined, undefined, -1, -1)).toBe(0);
        });
    });

    describe('compareWithUndefined', () => {
        describe('basic comparison with default parameters', () => {
            it('should return 0 when both values are equal', () => {
                expect(compareWithUndefined(5, 5)).toBe(0);
                expect(compareWithUndefined('test', 'test')).toBe(0);
                expect(compareWithUndefined(true, true)).toBe(0);
                expect(compareWithUndefined(false, false)).toBe(0);
            });

            it('should return 0 when both values are undefined', () => {
                expect(compareWithUndefined(undefined, undefined)).toBe(0);
            });

            it('should return 0 when both values are null', () => {
                expect(compareWithUndefined(null, null)).toBe(0);
            });

            it('should return 1 when left value is undefined and right is defined', () => {
                expect(compareWithUndefined(undefined, 5)).toBe(1);
                expect(compareWithUndefined(undefined, 'test')).toBe(1);
                expect(compareWithUndefined(undefined, true)).toBe(1);
                expect(compareWithUndefined(undefined, false)).toBe(1);
            });

            it('should return 1 when left value is null and right is defined', () => {
                expect(compareWithUndefined(null, 5)).toBe(1);
                expect(compareWithUndefined(null, 'test')).toBe(1);
                expect(compareWithUndefined(null, true)).toBe(1);
            });

            it('should return -1 when left value is defined and right is undefined', () => {
                expect(compareWithUndefined(5, undefined)).toBe(-1);
                expect(compareWithUndefined('test', undefined)).toBe(-1);
                expect(compareWithUndefined(true, undefined)).toBe(-1);
                expect(compareWithUndefined(false, undefined)).toBe(-1);
            });

            it('should return -1 when left value is defined and right is null', () => {
                expect(compareWithUndefined(5, null)).toBe(-1);
                expect(compareWithUndefined('test', null)).toBe(-1);
                expect(compareWithUndefined(true, null)).toBe(-1);
            });

            it('should compare numbers correctly when both are defined', () => {
                expect(compareWithUndefined(1, 2)).toBe(-1);
                expect(compareWithUndefined(2, 1)).toBe(1);
                expect(compareWithUndefined(10, 5)).toBe(1);
                expect(compareWithUndefined(5, 10)).toBe(-1);
            });

            it('should compare strings correctly when both are defined', () => {
                expect(compareWithUndefined('a', 'b')).toBe(-1);
                expect(compareWithUndefined('b', 'a')).toBe(1);
                expect(compareWithUndefined('apple', 'banana')).toBe(-1);
                expect(compareWithUndefined('banana', 'apple')).toBe(1);
            });

            it('should compare booleans correctly when both are defined', () => {
                expect(compareWithUndefined(false, true)).toBe(-1);
                expect(compareWithUndefined(true, false)).toBe(1);
            });
        });

        describe('with custom orderK parameter', () => {
            it('should reverse comparison when orderK is -1', () => {
                expect(compareWithUndefined(1, 2, -1)).toBe(1);
                expect(compareWithUndefined(2, 1, -1)).toBe(-1);
                expect(compareWithUndefined('a', 'b', -1)).toBe(1);
                expect(compareWithUndefined('b', 'a', -1)).toBe(-1);
            });

            it('should maintain normal comparison when orderK is 1', () => {
                expect(compareWithUndefined(1, 2, 1)).toBe(-1);
                expect(compareWithUndefined(2, 1, 1)).toBe(1);
                expect(compareWithUndefined('a', 'b', 1)).toBe(-1);
                expect(compareWithUndefined('b', 'a', 1)).toBe(1);
            });

            it('should not affect undefined handling with orderK', () => {
                expect(compareWithUndefined(undefined, 5, -1)).toBe(1);
                expect(compareWithUndefined(5, undefined, -1)).toBe(-1);
                expect(compareWithUndefined(undefined, undefined, -1)).toBe(0);
            });
        });

        describe('with custom undefinedOrderK parameter', () => {
            it('should reverse undefined ordering when undefinedOrderK is -1', () => {
                expect(compareWithUndefined(undefined, 5, 1, -1)).toBe(-1);
                expect(compareWithUndefined(5, undefined, 1, -1)).toBe(1);
                expect(compareWithUndefined(null, 5, 1, -1)).toBe(-1);
                expect(compareWithUndefined(5, null, 1, -1)).toBe(1);
            });

            it('should maintain normal undefined ordering when undefinedOrderK is 1', () => {
                expect(compareWithUndefined(undefined, 5, 1, 1)).toBe(1);
                expect(compareWithUndefined(5, undefined, 1, 1)).toBe(-1);
                expect(compareWithUndefined(null, 5, 1, 1)).toBe(1);
                expect(compareWithUndefined(5, null, 1, 1)).toBe(-1);
            });

            it('should not affect defined value comparison with undefinedOrderK', () => {
                expect(compareWithUndefined(1, 2, 1, -1)).toBe(-1);
                expect(compareWithUndefined(2, 1, 1, -1)).toBe(1);
                expect(compareWithUndefined('a', 'b', 1, -1)).toBe(-1);
                expect(compareWithUndefined('b', 'a', 1, -1)).toBe(1);
            });

            it('should still return 0 for both undefined regardless of undefinedOrderK', () => {
                expect(compareWithUndefined(undefined, undefined, 1, -1)).toBe(0);
                expect(compareWithUndefined(null, null, 1, -1)).toBe(0);
            });
        });

        describe('with both custom orderK and undefinedOrderK parameters', () => {
            it('should apply both parameters correctly', () => {
                // Reverse both order and undefined order
                expect(compareWithUndefined(1, 2, -1, -1)).toBe(1);
                expect(compareWithUndefined(2, 1, -1, -1)).toBe(-1);
                expect(compareWithUndefined(undefined, 5, -1, -1)).toBe(-1);
                expect(compareWithUndefined(5, undefined, -1, -1)).toBe(1);
            });

            it('should handle mixed parameter combinations', () => {
                // Normal order, reverse undefined order
                expect(compareWithUndefined(1, 2, 1, -1)).toBe(-1);
                expect(compareWithUndefined(undefined, 5, 1, -1)).toBe(-1);
                expect(compareWithUndefined(5, undefined, 1, -1)).toBe(1);

                // Reverse order, normal undefined order
                expect(compareWithUndefined(1, 2, -1, 1)).toBe(1);
                expect(compareWithUndefined(undefined, 5, -1, 1)).toBe(1);
                expect(compareWithUndefined(5, undefined, -1, 1)).toBe(-1);
            });
        });

        describe('edge cases', () => {
            it('should handle zero values correctly', () => {
                expect(compareWithUndefined(0, 0)).toBe(0);
                expect(compareWithUndefined(0, 1)).toBe(-1);
                expect(compareWithUndefined(1, 0)).toBe(1);
                expect(compareWithUndefined(0, undefined)).toBe(-1);
                expect(compareWithUndefined(undefined, 0)).toBe(1);
            });

            it('should handle empty strings correctly', () => {
                expect(compareWithUndefined('', '')).toBe(0);
                expect(compareWithUndefined('', 'a')).toBe(-1);
                expect(compareWithUndefined('a', '')).toBe(1);
                expect(compareWithUndefined('', undefined)).toBe(-1);
                expect(compareWithUndefined(undefined, '')).toBe(1);
            });

            it('should handle mixed null and undefined', () => {
                expect(compareWithUndefined(null, undefined)).toBe(1);
                expect(compareWithUndefined(undefined, null)).toBe(1);
            });

            it('should handle negative numbers', () => {
                expect(compareWithUndefined(-1, -2)).toBe(1);
                expect(compareWithUndefined(-2, -1)).toBe(-1);
                expect(compareWithUndefined(-1, 1)).toBe(-1);
                expect(compareWithUndefined(1, -1)).toBe(1);
            });
        });
    });
});
