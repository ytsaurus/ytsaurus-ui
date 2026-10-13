import React from 'react';
import cn from 'bem-cn-lite';

import {YTDFDialog} from '../../../../../containers/Dialog';
import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';
import {FlowDialogCloseButton} from '../FlowDialogCloseButton';
import {castKeyValue} from '../state-key';
import i18n from './i18n';
import modalI18n from '../../../../../components/Modal/i18n';
import type {FlowKeyColumn} from '../../../../../../shared/yt-types';

import './FlowStateKeyBuilder.scss';

const block = cn('yt-flow-state-key-dialog');

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

function validateKeyFormValues(
    columns: Array<FlowKeyColumn>,
    formValues: Record<string, string>,
): Record<string, string> {
    const normalized = toKeyFormValues(columns, toSchemaValues(columns, formValues));
    const filledFieldIds = columns
        .map((_column, index) => getKeyFieldId(index))
        .filter((fieldId) => normalized[fieldId].trim());
    const errors = Object.fromEntries(
        columns.flatMap((column, index) => {
            const fieldId = getKeyFieldId(index);
            const value = normalized[fieldId];
            if (!value.trim()) {
                return filledFieldIds.length > 0 && filledFieldIds.length < columns.length
                    ? [[fieldId, i18n('validation_fill-all-keys')]]
                    : [];
            }
            const casted = castKeyValue(column, value);
            return 'error' in casted
                ? [[fieldId, i18n(casted.error.errorKey, casted.error.params)]]
                : [];
        }),
    );
    return errors;
}

export function FlowStateKeyDialog({
    visible,
    columns,
    values,
    onApply,
    onClose,
}: FlowStateKeyDialogProps) {
    const titleId = React.useId();
    if (!visible) {
        return null;
    }

    const fieldIds = columns.map((_column, index) => getKeyFieldId(index));

    return (
        <DialogWrapper
            open
            size="s"
            className={block()}
            aria-labelledby={titleId}
            hasCloseButton={false}
            onClose={onClose}
        >
            <DialogWrapper.Header
                caption={i18n('title_edit-key-fields')}
                id={titleId}
                insertAfter={<FlowDialogCloseButton onClick={onClose} />}
            />
            <YTDFDialog<Record<string, string>>
                visible
                modal={false}
                size="s"
                pristineSubmittable
                footerProps={{
                    textApply: i18n('action_apply-key-fields'),
                    textCancel: modalI18n('action_cancel'),
                }}
                initialValues={toKeyFormValues(columns, values)}
                validate={(formValues) => validateKeyFormValues(columns, formValues)}
                fields={columns.map((column, index) => ({
                    name: getKeyFieldId(index),
                    type: 'text',
                    fullWidth: true,
                    validateFields: fieldIds,
                    className: block('field'),
                    extras: {
                        id: getKeyFieldId(index),
                        label: column.name,
                        placeholder: column.type,
                        hasClear: false,
                    },
                }))}
                onAdd={async (form) => {
                    onApply(toSchemaValues(columns, form.getState().values));
                    onClose();
                }}
                onClose={onClose}
            />
        </DialogWrapper>
    );
}
