import {ValidatorError} from './SettingsItemForm';

export const VALIDATOR_ERRORS_TEXT = {
    NAME_REQUIRED: 'Name is required field',
    NAME_ALREADY_EXIST: 'This name is already in use, please type some another',
    VALUE_REQUIRED: 'Values is required field',
};

export const formValidator = (name: string, value: string): ValidatorError => {
    const result: ValidatorError = {};
    if (!name) result['name'] = VALIDATOR_ERRORS_TEXT.NAME_REQUIRED;
    if (!value) result['value'] = VALIDATOR_ERRORS_TEXT.VALUE_REQUIRED;
    return result;
};
