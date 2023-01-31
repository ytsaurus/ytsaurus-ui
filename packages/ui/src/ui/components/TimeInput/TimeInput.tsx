import React, {useState, useCallback, useMemo} from 'react';
import cn from 'bem-cn-lite';

import {TextInput, TextInputProps} from '@gravity-ui/uikit';

import hammer from '../../common/hammer';

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
        () => (isNaN(parseValue(text)) ? 'Wrong format. Use hh:mm:ss' : undefined),
        [text],
    );

    return (
        <div className={b()}>
            <TextInput {...rest} error={error} value={text} onUpdate={onTextInputChange} />
        </div>
    );
}
