import ypath from './ypath';

describe('thor/ypath', () => {
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
                expect(ypath.getNumberDeprecated(node, '/@test_number')).toBe(2);
                expect(ypath.getNumberDeprecated(node, '/@test_valid_string')).toBe(2);
                expect(() => {
                    ypath.getNumberDeprecated(node, '/@test_invalid_string');
                }).toThrow(Error);
                expect(ypath.getNumberDeprecated(node, '/@test_undefined')).toBeUndefined();
                expect(() => {
                    ypath.getNumberDeprecated(node, '/@test_null');
                }).toThrow(Error);
            });
        });
        describe('with default value:', () => {
            it('test', () => {
                expect(ypath.getNumberDeprecated(node, '/@test_number', 4)).toBe(2);
                expect(ypath.getNumberDeprecated(node, '/@test_valid_string', 4)).toBe(2);
                expect(ypath.getNumberDeprecated(node, '/@test_invalid_string', 4)).toBe(4);
                expect(ypath.getNumberDeprecated(node, '/@test_undefined', 4)).toBe(4);
                expect(ypath.getNumberDeprecated(node, '/@test_null', 4)).toBe(4);
            });
        });
        describe('with default value = NaN:', () => {
            it('test', () => {
                expect(ypath.getNumberDeprecated(node, '/@test_number', NaN)).toBe(2);
                expect(ypath.getNumberDeprecated(node, '/@test_valid_string', NaN)).toBe(2);
                expect(
                    ypath.getNumberDeprecated(node, '/@test_invalid_string', NaN),
                ).toBeUndefined();
                expect(ypath.getNumberDeprecated(node, '/@test_undefined', NaN)).toBe(NaN);
                expect(ypath.getNumberDeprecated(node, '/@test_null', NaN)).toBeUndefined();
            });
        });
    });
});
