import {validateNumber} from './validate-number';

describe('validateNumber', () => {
    it('should return error message when value is undefined', () => {
        const result = validateNumber({});
        expect(result).toBe('Incorrect value');
    });

    it('should return error message when value is NaN', () => {
        const result = validateNumber({}, NaN);
        expect(result).toBe('Incorrect value');
    });

    it('should return undefined when no constraints are provided', () => {
        const result = validateNumber({}, 42);
        expect(result).toBeUndefined();
    });

    it('should validate greater than or equal (ge) constraint - valid case', () => {
        const result = validateNumber({ge: 10}, 15);
        expect(result).toBeUndefined();
    });

    it('should validate greater than or equal (ge) constraint - edge case', () => {
        const result = validateNumber({ge: 10}, 10);
        expect(result).toBeUndefined();
    });

    it('should validate greater than or equal (ge) constraint - invalid case', () => {
        const result = validateNumber({ge: 10}, 5);
        expect(result).toBe('The value must be \u2265 10');
    });

    it('should validate less than or equal (le) constraint - valid case', () => {
        const result = validateNumber({le: 100}, 50);
        expect(result).toBeUndefined();
    });

    it('should validate less than or equal (le) constraint - edge case', () => {
        const result = validateNumber({le: 100}, 100);
        expect(result).toBeUndefined();
    });

    it('should validate less than or equal (le) constraint - invalid case', () => {
        const result = validateNumber({le: 100}, 150);
        expect(result).toBe('The value must be \u2264 100');
    });

    it('should validate greater than (gt) constraint - valid case', () => {
        const result = validateNumber({gt: 10}, 15);
        expect(result).toBeUndefined();
    });

    it('should validate greater than (gt) constraint - edge case (invalid)', () => {
        const result = validateNumber({gt: 10}, 10);
        expect(result).toBe('The value must be > 10');
    });

    it('should validate less than (lt) constraint - valid case', () => {
        const result = validateNumber({lt: 100}, 50);
        expect(result).toBeUndefined();
    });

    it('should validate less than (lt) constraint - edge case (invalid)', () => {
        const result = validateNumber({lt: 100}, 100);
        expect(result).toBe('The value must be < 100');
    });

    it('should validate multiple constraints - all valid', () => {
        const result = validateNumber({ge: 10, le: 100}, 50);
        expect(result).toBeUndefined();
    });

    it('should validate multiple constraints - one invalid (ge)', () => {
        const result = validateNumber({ge: 10, le: 100}, 5);
        expect(result).toBe('The value must be \u2265 10');
    });

    it('should validate multiple constraints - one invalid (le)', () => {
        const result = validateNumber({ge: 10, le: 100}, 150);
        expect(result).toBe('The value must be \u2264 100');
    });

    it('should validate all types of constraints together', () => {
        const result = validateNumber({ge: 10, le: 100, gt: 5, lt: 200}, 50);
        expect(result).toBeUndefined();
    });

    it('should check constraints in order: ge, le, gt, lt', () => {
        // When multiple constraints fail, it should return the first failure in order
        const result = validateNumber({ge: 50, le: 40, gt: 60, lt: 30}, 20);
        expect(result).toBe('The value must be \u2265 50');
    });
    describe('parse parameter', () => {
        it('should parse string values to numbers when parse is true', () => {
            const result = validateNumber({allowParse: true}, '42');
            expect(result).toBeUndefined();
        });

        it('should validate constraints after parsing', () => {
            const resultGe = validateNumber({ge: 10, allowParse: true}, '15');
            expect(resultGe).toBeUndefined();

            const resultGeInvalid = validateNumber({ge: 10, allowParse: true}, '5');
            expect(resultGeInvalid).toBe('The value must be \u2265 10');

            const resultLe = validateNumber({le: 100, allowParse: true}, '50');
            expect(resultLe).toBeUndefined();

            const resultLeInvalid = validateNumber({le: 100, allowParse: true}, '150');
            expect(resultLeInvalid).toBe('The value must be \u2264 100');
        });

        it('should handle invalid string values', () => {
            const result = validateNumber({allowParse: true}, 'not-a-number');
            expect(result).toBe('Incorrect value');

            const resultEmpty = validateNumber({allowParse: true}, '');
            expect(resultEmpty).toBe('Incorrect value');
        });

        it('should handle invalid string values: null', () => {
            const result = validateNumber({allowParse: true}, 'not-a-number');
            expect(result).toBe('Incorrect value');

            const resultEmpty = validateNumber({allowParse: true}, null as any);
            expect(resultEmpty).toBe('Incorrect value');
        });

        it('should not parse when parse is false or undefined', () => {
            const resultUndefined = validateNumber({}, '42');
            expect(resultUndefined).toBe('Incorrect value');

            const resultFalse = validateNumber({allowParse: false}, '42');
            expect(resultFalse).toBe('Incorrect value');
        });

        it('should handle edge cases with parsing', () => {
            const resultZero = validateNumber({allowParse: true}, '0');
            expect(resultZero).toBeUndefined();

            const resultNegative = validateNumber({allowParse: true}, '-5');
            expect(resultNegative).toBeUndefined();

            const resultFloat = validateNumber({allowParse: true}, '3.14');
            expect(resultFloat).toBeUndefined();

            const resultNegativeWithConstraint = validateNumber({ge: 0, allowParse: true}, '-5');
            expect(resultNegativeWithConstraint).toBe('The value must be \u2265 0');
        });
    });
});
