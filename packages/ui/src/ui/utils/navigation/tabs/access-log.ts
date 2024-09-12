import reduce_ from 'lodash/reduce';

import type {
    AccessLogFieldSelectorType,
    AccessLogMethodType,
    AccessLogScopeType,
    AccessLogUserType,
} from '../../../store/reducers/navigation/tabs/access-log/access-log-filters';

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
    text: string;
    value: AccessLogFieldSelectorType;
}> = [
    {text: 'Scope', value: 'scope'},
    {text: 'User type', value: 'user_type'},
    {text: 'Method group', value: 'method_group'},
    {text: 'Transaction info', value: 'transaction_info'},
];

export function accessLogFieldSelectorSelectionToValue<EmptyValue>(
    selection: Array<AccessLogFieldSelectorType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}

export const ACCESS_LOG_METHOD_ITEMS: Array<{text: string; value: AccessLogMethodType}> = [
    {text: 'Read', value: 'read'},
    {text: 'Write', value: 'write'},
    {text: 'Lock', value: 'lock'},
    {text: 'Link', value: 'link'},
    {text: 'Copy/Move', value: 'copy_move'},
    {text: 'Dynamic table commands', value: 'dynamic_table_commands'},
];

export function accessLogMethodSelectionToValue<EmptyValue>(
    selection: Array<AccessLogMethodType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}

export const ACCESS_LOG_USER_TYPE_ITEMS: Array<{text: string; value: AccessLogUserType}> = [
    {text: 'Human', value: 'human'},
    {text: 'Robot', value: 'robot'},
    {text: 'System', value: 'system'},
];

export function accessLogUserTypeSelectionToValue<EmptyValue>(
    selection: Array<AccessLogUserType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}

export const ACCESS_LOG_SCOPE_ITEMS: Array<{text: string; value: AccessLogScopeType}> = [
    {text: 'Table', value: 'table'},
    {text: 'Directory', value: 'directory'},
    {text: 'File', value: 'file'},
    {text: 'Document', value: 'document'},
    {text: 'Other', value: 'other'},
];

export function accessLogScopeSelectionToValue<EmptyValue>(
    selection: Array<AccessLogScopeType>,
    emptyValue: EmptyValue,
) {
    return selectionToValue(selection, emptyValue);
}
