import {type QueryListFilterConfig} from '@gravity-ui/querieskit';
// QueriesKit 2.1.1 omits these built-in field registry declarations from its root export.
import type {} from '@gravity-ui/querieskit/build/esm/components/SimpleForm/SelectField.js';
import type {} from '@gravity-ui/querieskit/build/esm/components/SimpleForm/SwitchField.js';
import type {} from '@gravity-ui/querieskit/build/esm/components/SimpleForm/RangeDatePickerField.js';

import {QueryEnginesNames} from '../../../../../shared/constants/engines';
import {Engines, isEngine} from '../../../../types/query-tracker/api';
import i18n from '../i18n';

export const ALL_VALUE = '__all';

export function getEngineFilterField(): NonNullable<QueryListFilterConfig['fields']>[number] {
    return {
        id: 'engine',
        type: 'select',
        title: i18n('filter_engine'),
        options: [
            {value: ALL_VALUE, content: i18n('value_all')},
            ...Engines.map((engine) => ({value: engine, content: QueryEnginesNames[engine]})),
        ],
    };
}

export function getSelectedEngine(values?: string[]) {
    const selected = values?.[0];
    return selected && isEngine(selected) ? selected : undefined;
}
