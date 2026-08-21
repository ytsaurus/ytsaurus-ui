import React from 'react';

import {type DialogField, YTDFDialog} from '../../../../../containers/Dialog';

import {castKeyValue} from '../state-filters';
import i18n from './i18n';
import type {FlowKeyColumn} from '../../../../../../shared/yt-types';

export type FlowStateKeyDialogProps = {
    visible: boolean;
    columns: Array<FlowKeyColumn>;
    values: Record<string, string>;
    onApply: (values: Record<string, string>) => void;
    onClose: () => void;
};

export function getKeyFieldId(index: number): string {
    return `key_${index}`;
}

export function toKeyFormValues(
    columns: Array<FlowKeyColumn>,
    values: Record<string, string>,
): Record<string, string> {
    return Object.fromEntries(
        columns.map(({name}, index) => [
            getKeyFieldId(index),
            Object.prototype.hasOwnProperty.call(values, name) ? values[name] : '',
        ]),
    );
}

export function toSchemaValues(
    columns: Array<FlowKeyColumn>,
    formValues: Record<string, string>,
): Record<string, string> {
    return Object.fromEntries(
        columns.map(({name}, index) => [name, formValues[getKeyFieldId(index)] ?? '']),
    );
}

export function FlowStateKeyDialog({
    visible,
    columns,
    values,
    onApply,
    onClose,
}: FlowStateKeyDialogProps) {
    const fields = React.useMemo<Array<DialogField<Record<string, string>>>>(
        () =>
            columns.map((column, index) => ({
                name: getKeyFieldId(index),
                type: 'text',
                caption: `${column.name} (${column.type})`,
                validator: (value: string) => {
                    if (!value?.trim()) {
                        return undefined;
                    }
                    const casted = castKeyValue(column, value);
                    return 'error' in casted
                        ? i18n(casted.error.errorKey, casted.error.params)
                        : undefined;
                },
            })),
        [columns],
    );

    return (
        <YTDFDialog<Record<string, string>>
            visible={visible}
            size="s"
            headerProps={{title: i18n('title_edit-key-fields')}}
            footerProps={{textApply: i18n('action_apply-key-fields')}}
            pristineSubmittable
            initialValues={toKeyFormValues(columns, values)}
            fields={fields}
            validate={(nextValues) => {
                const normalized = toKeyFormValues(columns, toSchemaValues(columns, nextValues));
                const filledColumns = columns.filter((_column, index) =>
                    normalized[getKeyFieldId(index)].trim(),
                );
                if (filledColumns.length === 0 || filledColumns.length === columns.length) {
                    return undefined;
                }
                return Object.fromEntries(
                    columns
                        .map((_column, index) => getKeyFieldId(index))
                        .filter((fieldId) => !normalized[fieldId].trim())
                        .map((fieldId) => [fieldId, i18n('validation_fill-all-keys')]),
                );
            }}
            onAdd={(form) => {
                onApply(toSchemaValues(columns, form.getState().values));
                onClose();
                return Promise.resolve();
            }}
            onClose={onClose}
        />
    );
}
