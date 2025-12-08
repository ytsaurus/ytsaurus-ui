import {ValidatorError} from './SettingsItemForm';
import i18n from './helpers/i18n';

export const VALIDATOR_ERRORS_TEXT = {
    NAME_REQUIRED: i18n('alert_name-required'),
    NAME_ALREADY_EXIST: i18n('alert_name-already-exist'),
    VALUE_REQUIRED: i18n('alert_value-required'),
};

export const formValidator = (name: string, value: string): ValidatorError => {
    const result: ValidatorError = {};
    if (!name) result['name'] = VALIDATOR_ERRORS_TEXT.NAME_REQUIRED;
    if (!value) result['value'] = VALIDATOR_ERRORS_TEXT.VALUE_REQUIRED;
    return result;
};
