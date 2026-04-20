import React, {useCallback, useMemo, useState} from 'react';
import cn from 'bem-cn-lite';

import {TextInput, type TextInputProps} from '@gravity-ui/uikit';

import hammer from '../../common/hammer';
import i18n from './i18n';

export interface TimeInputProps
    extends Omit<TextInputProps, 'value' | 'text' | 'onChange' | 'error'> {
    value: number;
    onChange: (v: number) => void;
}

const regexp = new RegExp('^[0-9]{2}:[0-9]{2}:[0-9]{2}$');
const b = cn('time-input');

const formatValue = (value: number): string => hammer.format['TimeDuration'](value);
const parseValue = (value: string): number => {
    if (regexp.test(value)) {
        return (
            value
                .split(':')
                .reverse()
                .reduce((acc: number, curr: string, i: number): number => {
                    return acc + Number(curr) * Math.pow(60, i);
                }, 0) * 1000
        );
    }

    return NaN;
};

export default function TimeInput(props: TimeInputProps) {
    const {value, onChange, ...rest} = props;

    const [text, setText] = useState(formatValue(value));

    const onTextInputChange = useCallback(
        (newText: string) => {
            const newValue = parseValue(newText);

            setText(newText);
            onChange(newValue);
        },
        [onChange, setText],
    );

    const error = useMemo(
        () => (isNaN(parseValue(text)) ? i18n('error_wrong-format') : undefined),
        [text],
    );

    return (
        <div className={b()}>
            <TextInput {...rest} error={error} value={text} onUpdate={onTextInputChange} />
        </div>
    );
}
