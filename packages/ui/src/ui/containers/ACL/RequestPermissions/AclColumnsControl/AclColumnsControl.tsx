import React from 'react';
import {TextArea} from '@gravity-ui/uikit';
import debounce_ from 'lodash/debounce';
import i18n from './i18n';

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

    const onEdit = React.useMemo(() => {
        return debounce_((v) => {
            onChange(valueFromString(v));
        }, 500);
    }, []);

    const textValue = React.useMemo(() => {
        return valueToString(value);
    }, [value]);

    return (
        <TextArea
            placeholder={i18n('context_columns-placeholder')}
            value={editText ?? textValue}
            disabled={disabled}
            onUpdate={(val) => {
                setEditText(val);
                onEdit(val);
            }}
            onFocus={() => {
                setEditText(valueToString(value));
            }}
            onBlur={() => {
                onEdit(editText);
                onEdit.flush();

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
