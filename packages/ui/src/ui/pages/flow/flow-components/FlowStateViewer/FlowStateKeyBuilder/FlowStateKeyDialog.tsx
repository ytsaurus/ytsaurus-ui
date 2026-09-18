import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, TextInput} from '@gravity-ui/uikit';

import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';

import {FlowDialogCloseButton} from '../FlowDialogCloseButton';
import {castKeyValue} from '../state-filters';
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
    const [formValues, setFormValues] = React.useState(() => toKeyFormValues(columns, values));
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const wasVisibleRef = React.useRef(false);

    React.useEffect(() => {
        const opening = visible && !wasVisibleRef.current;
        wasVisibleRef.current = visible;
        if (opening) {
            setFormValues(toKeyFormValues(columns, values));
            setErrors({});
        }
    }, [columns, values, visible]);

    const handleApply = () => {
        const normalizedFormValues = Object.fromEntries(
            columns.map((_column, index) => {
                const fieldId = getKeyFieldId(index);
                return [fieldId, (formValues[fieldId] ?? '').trim()];
            }),
        );
        const nextErrors = validateKeyFormValues(columns, normalizedFormValues);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return;
        }
        onApply(toSchemaValues(columns, normalizedFormValues));
        onClose();
    };

    return (
        <DialogWrapper
            open={visible}
            size="s"
            aria-labelledby={titleId}
            hasCloseButton={false}
            onClose={onClose}
        >
            <DialogWrapper.Header
                caption={i18n('title_edit-key-fields')}
                id={titleId}
                insertAfter={<FlowDialogCloseButton onClick={onClose} />}
            />
            <DialogWrapper.Body>
                <Flex direction="column" gap={3}>
                    {columns.map((column, index) => {
                        const fieldId = getKeyFieldId(index);
                        const error = errors[fieldId];
                        return (
                            <Flex
                                key={fieldId}
                                direction="column"
                                gap={1}
                                className={block('field')}
                            >
                                <TextInput
                                    id={fieldId}
                                    label={column.name}
                                    placeholder={column.type}
                                    value={formValues[fieldId]}
                                    validationState={error ? 'invalid' : undefined}
                                    errorMessage={error}
                                    onUpdate={(value) => {
                                        setFormValues((current) => ({
                                            ...current,
                                            [fieldId]: value,
                                        }));
                                        setErrors((current) => {
                                            const next = {...current};
                                            delete next[fieldId];
                                            return next;
                                        });
                                    }}
                                />
                            </Flex>
                        );
                    })}
                </Flex>
            </DialogWrapper.Body>
            <DialogWrapper.Footer
                preset="default"
                textButtonApply={i18n('action_apply-key-fields')}
                textButtonCancel={modalI18n('action_cancel')}
                onClickButtonApply={handleApply}
                onClickButtonCancel={onClose}
            />
        </DialogWrapper>
    );
}
