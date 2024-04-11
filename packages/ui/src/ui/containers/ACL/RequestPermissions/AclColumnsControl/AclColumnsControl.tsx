import React from 'react';

import {TextArea} from '@gravity-ui/uikit';

export type Props = {
    value?: Array<string>;
    onChange: (value?: Props['value']) => void;
    disabled?: boolean;
    rows?: number;
};

function stopPropagation(e: React.KeyboardEvent) {
    e.stopPropagation();
}

function valueToString(value?: Array<string>) {
    return value?.join('\n') ?? '';
}

function valueFromString(text?: string) {
    return text?.split('\n') ?? [];
}

export function AclColumnsControl({value, onChange, disabled}: Props) {
    const [editText, setEditText] = React.useState<string | undefined>();
    const textValue = React.useMemo(() => {
        return valueToString(value);
    }, [value]);

    return (
        <TextArea
            placeholder="Enter one column name per line"
            value={editText ?? textValue}
            disabled={disabled}
            onUpdate={(val) => {
                setEditText(val);
            }}
            onFocus={() => {
                setEditText(valueToString(value));
            }}
            onBlur={() => {
                onChange(valueFromString(editText));
                setEditText(undefined);
            }}
            minRows={5}
            maxRows={10}
            onKeyDown={stopPropagation}
            onKeyUp={stopPropagation}
            onKeyPress={stopPropagation}
        />
    );
}

AclColumnsControl.isEmpty = (value?: Props['value']) => {
    return !value?.length;
};

AclColumnsControl.getDefaultValue = () => {
    return undefined;
};
