import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, TextInput} from '@gravity-ui/uikit';

import {SelectSingle} from '../../../../../components/Select/Select';

import {castKeyValue} from '../helpers';
import i18n from './i18n';
import type {FlowKeyColumn} from '../types';

import './FlowStateKeyBuilder.scss';

const block = cn('yt-flow-state-key-builder');

export type FlowStateKeyBuilderProps = {
    columns: Array<FlowKeyColumn>;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
};

const BOOLEAN_ITEMS = [
    {value: 'true', text: 'true'},
    {value: 'false', text: 'false'},
];

function KeyColumnInput({
    column,
    value,
    onChange,
}: {
    column: FlowKeyColumn;
    value: string;
    onChange: (value: string) => void;
}) {
    const [touched, setTouched] = React.useState(false);
    const label = `${column.name} (${column.type})`;

    if (column.type === 'boolean') {
        return (
            <SelectSingle
                className={block('input')}
                width="max"
                label={label}
                value={value || undefined}
                items={BOOLEAN_ITEMS}
                hasClear
                onChange={(next) => onChange(next ?? '')}
            />
        );
    }

    const casted = value.trim() ? castKeyValue(column, value) : undefined;
    const validationError =
        touched && casted && 'error' in casted
            ? i18n(casted.error.errorKey, casted.error.params)
            : undefined;

    return (
        <TextInput
            className={block('input')}
            label={label}
            value={value}
            hasClear
            validationState={validationError ? 'invalid' : undefined}
            errorMessage={validationError}
            onUpdate={onChange}
            onBlur={() => setTouched(true)}
        />
    );
}

export function FlowStateKeyBuilder({columns, values, onChange}: FlowStateKeyBuilderProps) {
    return (
        <Flex gap={2} wrap>
            {columns.map((column) => (
                <KeyColumnInput
                    key={column.name}
                    column={column}
                    value={values[column.name] ?? ''}
                    onChange={(next) => onChange({...values, [column.name]: next})}
                />
            ))}
        </Flex>
    );
}

export default FlowStateKeyBuilder;
