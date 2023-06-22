import {countValues, prepare} from './aggregation';

describe('hammer.aggregation', () => {
    describe('API', () => {
        describe('prepare', () => {
            it('Exports', () => {
                expect(prepare).toBeDefined();
            });

            it('isFunction', () => {
                expect(prepare).toBeFunction();
            });

            it('aggregation "count"', () => {
                const items = [{foo: 1}, {foo: 2}];

                const properties = [
                    {
                        name: 'count',
                        type: 'count',
                    },
                ];

                const result = [{count: 2}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation "sum"', () => {
                const items = [{foo: 1}, {foo: 2}];

                const properties = [
                    {
                        name: 'foo',
                        type: 'sum',
                    },
                ];

                const result = [{foo: 3}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation "max"', () => {
                const items = [{foo: 1}, {foo: 2}];

                const properties = [
                    {
                        name: 'foo',
                        type: 'max',
                    },
                ];

                const result = [{foo: 2}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation "min"', () => {
                const items = [{foo: 1}, {foo: 2}];

                const properties = [
                    {
                        name: 'foo',
                        type: 'min',
                    },
                ];

                const result = [{foo: 1}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation "concat-array"', () => {
                const items = [{foo: [1]}, {foo: [2]}];

                const properties = [
                    {
                        name: 'foo',
                        type: 'concat-array',
                    },
                ];

                const result = [{foo: [1, 2]}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation "concat-string"', () => {
                const items = [{foo: 'abc'}, {foo: 'def'}];

                const properties = [
                    {
                        name: 'foo',
                        type: 'concat-string',
                    },
                ];

                const result = [{foo: 'abcdef'}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation function', () => {
                const items = [{foo: 'abc'}, {foo: 'def'}];

                const properties = [
                    {
                        name: 'foo',
                        type: function (aggregation, item, name) {
                            aggregation[name] = aggregation[name] || '';

                            if (typeof item[name] === 'string') {
                                aggregation[name] += item[name];
                            }
                        },
                    },
                ];

                const result = [{foo: 'abcdef'}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('aggregation byProperty', () => {
                const items = [
                    {foo: 1, bar: 'baz'},
                    {foo: 2, bar: 'baz'},
                    {foo: 3, bar: 'abc'},
                    {foo: 4, bar: 'abc'},
                ];

                const properties = [
                    {
                        name: 'foo',
                        type: 'sum',
                    },
                ];

                const aggregateBy = 'bar';

                const result = [{foo: 10}, {foo: 3, bar: 'baz'}, {foo: 7, bar: 'abc'}];

                expect(prepare(items, properties, aggregateBy)).toEqual(result);
            });

            it('aggregation several properties', () => {
                const items = [
                    {foo: 1, bar: 'a'},
                    {foo: 2, bar: 'b'},
                    {foo: 3, bar: 'c'},
                    {foo: 4, bar: 'd'},
                ];

                const properties = [
                    {
                        name: 'foo',
                        type: 'sum',
                    },
                    {
                        name: 'bar',
                        type: 'concat-string',
                    },
                ];

                const result = [{foo: 10, bar: 'abcd'}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('nested aggregation', () => {
                const items = [
                    {foo: {bar: {baz: 1}}},
                    {foo: {bar: {baz: 2}}},
                    {foo: {bar: {baz: 3}}},
                    {foo: {bar: {boo: 10}}},
                ];

                const properties = [
                    {
                        name: 'foo.bar.baz',
                        type: 'nested/sum',
                    },
                ];

                const result = [{foo: {bar: {baz: 6}}}];

                expect(prepare(items, properties)).toEqual(result);
            });

            it('throws on unknown aggregation', () => {
                expect(() => {
                    const items = [
                        {foo: 1, bar: 'a'},
                        {foo: 2, bar: 'b'},
                        {foo: 3, bar: 'c'},
                        {foo: 4, bar: 'd'},
                    ];

                    const properties = [
                        {
                            name: 'foo',
                            type: 'sum',
                        },
                        {
                            name: 'bar',
                            type: 'upyachka',
                        },
                    ];

                    prepare(items, properties);
                }).toThrow(Error);
            });

            it('reports lastItem', () => {
                const items = [{foo: 'abc'}, {foo: 'def'}];

                const properties = [
                    {
                        name: 'foo',
                        type: function (aggregation, item, name, lastItem) {
                            if (item.name === 'abc') {
                                expect(lastItem).toBe(false);
                            }

                            if (item.name === 'def') {
                                expect(lastItem).toBe(true);
                            }
                        },
                    },
                ];

                prepare(items, properties);
            });
        });

        describe('countValues', () => {
            it('must correctly count the number of values on the key passed without initial result object', () => {
                const items = [
                    {
                        type: 'foo',
                    },
                    {
                        type: 'foo',
                    },
                    {
                        type: 'bar',
                    },
                ];

                const result = {
                    foo: 2,
                    bar: 1,
                };

                expect(countValues(items, 'type')).toEqual(result);
            });

            it('must correctly count the number of values on the key passed with initial result object', () => {
                const items = [
                    {
                        type: 'foo',
                    },
                    {
                        type: 'foo',
                    },
                    {
                        type: 'bar',
                    },
                ];

                const result = {
                    all: 3,
                    foo: 2,
                    bar: 1,
                };

                expect(countValues(items, 'type', {all: items.length})).toEqual(result);
            });

            it('must ignore the object, in which there is no field with the passed key', () => {
                const items = [
                    {
                        type: 'foo',
                    },
                    {
                        name: 'foo',
                    },
                    {
                        type: 'bar',
                    },
                ];

                const result = {
                    foo: 1,
                    bar: 1,
                };

                expect(countValues(items, 'type')).toEqual(result);
            });
        });
    });
});
