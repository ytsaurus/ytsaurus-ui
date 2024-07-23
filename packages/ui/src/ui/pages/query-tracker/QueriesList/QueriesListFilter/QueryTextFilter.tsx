import {TextInput} from '@gravity-ui/uikit';
import debounce_ from 'lodash/debounce';
import React, {useEffect, useMemo, useState} from 'react';

export type QueryTextFilterProps = {
    value?: string;
    placeholder: string;
    onChange: (value?: string) => void;
    delay?: number;
};

export function QueryTextFilter({value, placeholder, onChange, delay = 200}: QueryTextFilterProps) {
    const [pattern, setPattern] = useState<string>(value || '');

    const debouncedChange = useMemo(() => {
        return debounce_((value: string) => {
            onChange(value);
        }, delay);
    }, [onChange, delay]);

    useEffect(() => {
        debouncedChange(pattern);
        return () => {
            debouncedChange.cancel();
        };
    }, [pattern, debouncedChange]);

    return (
        <TextInput
            placeholder={placeholder}
            value={pattern}
            onBlur={() => debouncedChange.flush()}
            onUpdate={setPattern}
        />
    );
}
