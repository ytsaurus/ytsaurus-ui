import {concatValidators} from './concat-validators';

describe('concatValidators', () => {
    let validator1, validator2, validator3;
    let result1, result2, result3;
    let combinedValidator;

    beforeEach(() => {
        validator1 = jest.fn(() => result1);
        validator2 = jest.fn(() => result2);
        validator3 = jest.fn(() => result3);
        result1 = null;
        result2 = null;
        result3 = null;
        combinedValidator = concatValidators(validator1, validator2, validator3);
    });

    it('should return undefined when all validators return falsy values', () => {
        result1 = null;
        result2 = false;
        result3 = '';

        const value = 'test value';
        const result = combinedValidator(value);

        expect(result).toBeUndefined();
        expect(validator1).toHaveBeenCalledWith(value);
        expect(validator2).toHaveBeenCalledWith(value);
        expect(validator3).toHaveBeenCalledWith(value);
        expect(validator1).toHaveBeenCalledTimes(1);
        expect(validator2).toHaveBeenCalledTimes(1);
        expect(validator3).toHaveBeenCalledTimes(1);
    });

    it('should return the first non-falsy result', () => {
        result1 = null;
        result2 = 'Error message';
        result3 = 'Another error';

        const value = 'test value';
        const result = combinedValidator(value);

        expect(result).toBe('Error message');
        expect(validator1).toHaveBeenCalledWith(value);
        expect(validator2).toHaveBeenCalledWith(value);
        expect(validator3).not.toHaveBeenCalled();
        expect(validator1).toHaveBeenCalledTimes(1);
        expect(validator2).toHaveBeenCalledTimes(1);
    });

    it('should stop at the first validator if it returns a non-falsy result', () => {
        result1 = 'First error';
        result2 = 'Second error';
        result3 = 'Third error';

        const value = 'test value';
        const result = combinedValidator(value);

        expect(result).toBe('First error');
        expect(validator1).toHaveBeenCalledWith(value);
        expect(validator2).not.toHaveBeenCalled();
        expect(validator3).not.toHaveBeenCalled();
        expect(validator1).toHaveBeenCalledTimes(1);
    });

    it('should handle different types of error results', () => {
        const errorObject = {message: 'Error object'};
        const errorValidators = concatValidators(
            () => null,
            () => errorObject,
            () => 'String error',
        );

        expect(errorValidators('any value')).toBe(errorObject);
    });
});
