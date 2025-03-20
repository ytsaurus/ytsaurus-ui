import ypath, {convertToNumber} from './ypath';

const {getNumber} = ypath;

describe('./thor/utils', () => {
    describe('convertToNumber', () => {
        describe('no default value:', () => {
            it('test', () => {
                expect(convertToNumber(2)).toBe(2);
                expect(convertToNumber('2')).toBe(2);
                expect(() => {
                    convertToNumber('asdasd');
                }).toThrow(Error);
                expect(convertToNumber(undefined)).toBe(undefined);
                expect(convertToNumber(null)).toBe(undefined);
            });
        });

        describe('with default value:', () => {
            it('test', () => {
                expect(convertToNumber(2, 4)).toBe(2);
                expect(convertToNumber('2', 4)).toBe(2);
                expect(convertToNumber('asdasd', 4)).toBe(4);
                expect(convertToNumber(undefined, 4)).toBe(4);
                expect(convertToNumber(null, 4)).toBe(4);
            });
        });
    });

    describe('getNumber', () => {
        const node = {
            $value: '/some/value',
            $attributes: {
                test_number: 2,
                test_valid_string: '2',
                test_invalid_string: 'asdasd',
                test_undefined: undefined,
                test_null: null,
                test_yson: {
                    $type: 'int64',
                    $value: '901',
                },
            },
        };
        describe('no default value:', () => {
            it('test', () => {
                expect(getNumber(node, '/@test_number')).toBe(2);
                expect(getNumber(node, '/@test_valid_string')).toBe(2);
                expect(() => {
                    getNumber(node, '/@test_invalid_string');
                }).toThrow(Error);
                expect(getNumber(node, '/@test_undefined')).toBeUndefined();
                expect(getNumber(node, '/@test_null')).toBeUndefined();
            });
        });
        describe('with default value:', () => {
            it('test', () => {
                expect(getNumber(node, '/@test_number', 4)).toBe(2);
                expect(getNumber(node, '/@test_valid_string', 4)).toBe(2);
                expect(getNumber(node, '/@test_invalid_string', 4)).toBe(4);
                expect(getNumber(node, '/@test_undefined', 4)).toBe(4);
                expect(getNumber(node, '/@test_null', 4)).toBe(4);
            });
        });
        describe('with default value = NaN:', () => {
            it('test', () => {
                expect(getNumber(node, '/@test_number', NaN)).toBe(2);
                expect(getNumber(node, '/@test_valid_string', NaN)).toBe(2);
                expect(getNumber(node, '/@test_invalid_string', NaN)).toBe(NaN);
                expect(getNumber(node, '/@test_undefined', NaN)).toBe(NaN);
                expect(getNumber(node, '/@test_null', NaN)).toBe(NaN);
            });
        });

        describe('yson', () => {
            it('test', () => {
                expect(getNumber(node, '/@test_yson')).toBe(901);
                expect(getNumber(node, '/@test_yson', -1)).toBe(901);
                expect(getNumber(node, '/@test_yson', NaN)).toBe(901);
            });
        });
    });
});
