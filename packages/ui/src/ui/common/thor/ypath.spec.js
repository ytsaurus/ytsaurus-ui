import _ypath from './ypath';

describe('./ypath', () => {
    it('Exports', () => {
        expect(_ypath).toBeDefined();
    });

    describe('getValue', () => {
        it('null is treated as an error if encountered in the middle', () => {
            const node = {
                $value: null,
                $attributes: {
                    recursive_resource_usage: null,
                },
            };

            expect(() => {
                _ypath.getValue(node, '/some_property');
            }).toThrow(Error);

            expect(() => {
                _ypath.getValue(node, '/@recursive_resource_usage');
            }).not.toThrow();
        });
    });

    describe('getBoolean', () => {
        it('gets boolean from boolean', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: true,
                    teleport: false,
                },
            };

            expect(_ypath.getBoolean(node, '/@append')).toBe(true);
            expect(_ypath.getBoolean(node, '/@teleport')).toBe(false);
        });

        it('gets boolean from string', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: 'true',
                    teleport: 'false',
                },
            };

            expect(_ypath.getBoolean(node, '/@append')).toBe(true);
            expect(_ypath.getBoolean(node, '/@teleport')).toBe(false);
        });

        it('plays well with undefined', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: undefined,
                    teleport: undefined,
                },
            };

            expect(_ypath.getBoolean(node, '/@append')).toBeUndefined();
            expect(_ypath.getBoolean(node, '/@teleport')).toBeUndefined();
        });

        it('everything else is treated as an error', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: 'foo',
                    teleport: 'foo',
                },
            };

            expect(() => {
                _ypath.getBoolean(node, '/@append');
            }).toThrow(Error);
            expect(() => {
                _ypath.getBoolean(node, '/@teleport');
            }).toThrow(Error);
        });
    });

    describe('getNumberDeprecated', () => {
        const node = {
            $value: '/some/value',
            $attributes: {
                test_number: 2,
                test_valid_string: '2',
                test_invalid_string: 'asdasd',
                test_undefined: undefined,
                test_null: null,
            },
        };
        describe('no default value:', () => {
            it('test', () => {
                expect(_ypath.getNumberDeprecated(node, '/@test_number')).toBe(2);
                expect(_ypath.getNumberDeprecated(node, '/@test_valid_string')).toBe(2);
                expect(() => {
                    _ypath.getNumberDeprecated(node, '/@test_invalid_string');
                }).toThrow(Error);
                expect(_ypath.getNumberDeprecated(node, '/@test_undefined')).toBeUndefined();
                expect(() => {
                    _ypath.getNumberDeprecated(node, '/@test_null');
                }).toThrow(Error);
            });
        });
        describe('with default value:', () => {
            it('test', () => {
                expect(_ypath.getNumberDeprecated(node, '/@test_number', 4)).toBe(2);
                expect(_ypath.getNumberDeprecated(node, '/@test_valid_string', 4)).toBe(2);
                expect(_ypath.getNumberDeprecated(node, '/@test_invalid_string', 4)).toBe(4);
                expect(_ypath.getNumberDeprecated(node, '/@test_undefined', 4)).toBe(4);
                expect(_ypath.getNumberDeprecated(node, '/@test_null', 4)).toBe(4);
            });
        });
        describe('with default value = NaN:', () => {
            it('test', () => {
                expect(_ypath.getNumberDeprecated(node, '/@test_number', NaN)).toBe(2);
                expect(_ypath.getNumberDeprecated(node, '/@test_valid_string', NaN)).toBe(2);
                expect(
                    _ypath.getNumberDeprecated(node, '/@test_invalid_string', NaN),
                ).toBeUndefined();
                expect(_ypath.getNumberDeprecated(node, '/@test_undefined', NaN)).toBe(NaN);
                expect(_ypath.getNumberDeprecated(node, '/@test_null', NaN)).toBeUndefined();
            });
        });
    });
});
