import reduce_ from 'lodash/reduce';

import {
    type AccessLogFieldSelectorType,
    type AccessLogMethodType,
    type AccessLogScopeType,
    type AccessLogUserType,
} from '../../../store/reducers/navigation/tabs/access-log/access-log-filters';
import i18n from './i18n';

export function valueToSelection<KeyType extends string, V>(value: Record<KeyType, V>) {
    return reduce_(
        value,
        (acc, v, key) => {
            if (v) {
                acc.push(key as KeyType);
            }
            return acc;
        },
        [] as Array<KeyType>,
    );
}

function selectionToValue<KeyType extends string, EmptyValue>(
    selected: Array<KeyType>,
    emptyValue: EmptyValue,
) {
    if (!selected.length) {
        return emptyValue;
    }
    return reduce_(
        selected,
        (acc, item) => {
            acc[item as KeyType] = true;
            return acc;
        },
        {} as Record<KeyType, boolean>,
    );
}

export const ACCESS_LOG_FIELD_SELECTOR_ITEMS: Array<{
    get text(): string;
    value: AccessLogFieldSelectorType;
}> = [
    {
        get text() {
            return i18n('field_scope');
        },
        value: 'scope',
    },
    {
        get text() {
            return i18n('field_user-type');
        },
        value: 'user_type',
    },
    {
        get text() {
            return i18n('field_method-group');
        },
        value: 'method_group',
    },
    {
        get text() {
            return i18n('field_transaction-info');
        },
        value: 'transaction_info',
    },
];

export function accessLogFieldSelectorSelectionToValue<EmptyValue>(
    selection: Array<AccessLogFieldSelectorType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}

export const ACCESS_LOG_METHOD_ITEMS: Array<{get text(): string; value: AccessLogMethodType}> = [
    {
        get text() {
            return i18n('value_read');
        },
        value: 'read',
    },
    {
        get text() {
            return i18n('value_write');
        },
        value: 'write',
    },
    {
        get text() {
            return i18n('value_lock');
        },
        value: 'lock',
    },
    {
        get text() {
            return i18n('value_link');
        },
        value: 'link',
    },
    {
        get text() {
            return i18n('value_copy-move');
        },
        value: 'copy_move',
    },
    {
        get text() {
            return i18n('value_dynamic-table-commands');
        },
        value: 'dynamic_table_commands',
    },
];

export function accessLogMethodSelectionToValue<EmptyValue>(
    selection: Array<AccessLogMethodType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}

export const ACCESS_LOG_USER_TYPE_ITEMS: Array<{get text(): string; value: AccessLogUserType}> = [
    {
        get text() {
            return i18n('value_human');
        },
        value: 'human',
    },
    {
        get text() {
            return i18n('value_robot');
        },
        value: 'robot',
    },
    {
        get text() {
            return i18n('value_system');
        },
        value: 'system',
    },
];

export function accessLogUserTypeSelectionToValue<EmptyValue>(
    selection: Array<AccessLogUserType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}

export const ACCESS_LOG_SCOPE_ITEMS: Array<{get text(): string; value: AccessLogScopeType}> = [
    {
        get text() {
            return i18n('value_table');
        },
        value: 'table',
    },
    {
        get text() {
            return i18n('value_directory');
        },
        value: 'directory',
    },
    {
        get text() {
            return i18n('value_file');
        },
        value: 'file',
    },
    {
        get text() {
            return i18n('value_document');
        },
        value: 'document',
    },
    {
        get text() {
            return i18n('value_other');
        },
        value: 'other',
    },
];

export function accessLogScopeSelectionToValue<EmptyValue>(
    selection: Array<AccessLogScopeType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}
